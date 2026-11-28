import { useEffect, useReducer, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { closeCompletion } from '@codemirror/autocomplete';
import { Action, Step } from './steps';
import { anchorFor, initialTour, playable, previousPlayable, readMs, Target, tour, TourEvent } from './tourEngine';
import './tutorial.css';

const NARROW = '(max-width: 1100px)';
const TOUCH = '(pointer: coarse)';
const MOVE_MS = 800;
const ANCHOR_WAIT_MS = 3000;
const TYPE_MS = 25;
const CARD_GAP = 16;
const CARD_WIDTH = 320;

type Rect = { left: number; top: number; width: number; height: number };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isNarrow = () => window.matchMedia(NARROW).matches;

function find(anchor: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${anchor}"]`);
  return [...all].find(el => el.getBoundingClientRect().width > 0) ?? null;
}

function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

async function waitFor(target: Target, alive: () => boolean): Promise<HTMLElement | null> {
  const anchor = anchorFor(target, isNarrow());
  for (let waited = 0; anchor && waited < ANCHOR_WAIT_MS && alive(); waited += 100) {
    const el = find(anchor);
    if (el) return el;
    await sleep(100);
  }
  return null;
}

async function typeInto(el: HTMLElement, text: string, alive: () => boolean) {
  const editor = el.querySelector<HTMLElement>('.cm-editor');
  const view = editor && EditorView.findFromDOM(editor);
  if (!view) return;
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } });
  for (let i = 0; i < text.length && alive(); i++) {
    view.dispatch({ changes: { from: i, insert: text[i] }, selection: { anchor: i + 1 } });
    await sleep(TYPE_MS);
  }
  closeCompletion(view);
}

/** Card beside the target when it fits, else below or above it, else docked to the bottom. */
function cardStyle(target: Rect | null, cardHeight: number): React.CSSProperties | undefined {
  if (!target || isNarrow()) return undefined;
  const fitsRight = target.left + target.width + CARD_GAP + CARD_WIDTH < window.innerWidth;
  const fitsLeft = target.left - CARD_GAP - CARD_WIDTH > 0;
  const top = Math.min(Math.max(CARD_GAP, target.top), window.innerHeight - cardHeight - CARD_GAP);
  if (fitsRight) return { left: target.left + target.width + CARD_GAP, top };
  if (fitsLeft) return { left: target.left - CARD_GAP - CARD_WIDTH, top };
  const left = Math.min(Math.max(CARD_GAP, target.left), window.innerWidth - CARD_WIDTH - CARD_GAP);
  if (target.top + target.height + CARD_GAP + cardHeight < window.innerHeight) return { left, top: target.top + target.height + CARD_GAP };
  if (target.top - CARD_GAP - cardHeight > 0) return { left, top: target.top - CARD_GAP - cardHeight };
  return undefined;
}

export function TourPlayer({steps, loop, onEnd}: {steps: Step[], loop: boolean, onEnd: () => void}) {
  const [state, dispatch] = useReducer((s: typeof initialTour, e: TourEvent) => tour(s, e, steps.length), initialTour);
  const spot = useRef<HTMLElement | null>(null);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);
  const [cursor, setCursor] = useState<{x: number, y: number}>({x: window.innerWidth / 2, y: window.innerHeight / 2});
  const [clicking, setClicking] = useState(0);
  const [ready, setReady] = useState(false);
  const [cardHeight, setCardHeight] = useState(160);
  const step = steps[state.index];
  const touch = window.matchMedia(TOUCH).matches;

  useEffect(() => {
    if (state.ended) onEnd();
  }, [state.ended, onEnd]);

  const back = () => {
    const to = previousPlayable(steps, state.index, isNarrow(), anchor => find(anchor) !== null);
    if (to !== null) dispatch({back: to});
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loop) dispatch('skip');
      if (e.key === 'ArrowRight') dispatch('next');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loop]);

  useEffect(() => {
    const timer = setInterval(() => setSpotRect(spot.current && rectOf(spot.current)), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const alive = () => active;
    const pointAt = async (el: HTMLElement) => {
      el.scrollIntoView({block: 'center', behavior: 'smooth'});
      await sleep(400);
      const r = el.getBoundingClientRect();
      setCursor({x: r.left + r.width / 2, y: r.top + r.height / 2});
      await sleep(MOVE_MS);
    };
    const act = async (action: Action) => {
      const el = await waitFor(action, alive);
      if (!el || !alive()) return;
      await pointAt(el);
      if (!alive()) return;
      if (action.do === 'type') {
        await typeInto(el, action.text, alive);
      } else {
        setClicking(c => c + 1);
        el.click();
      }
      await sleep(700);
    };

    const run = async () => {
      setReady(false);
      const el = step.anchor ? await waitFor(step, alive) : null;
      if (!alive()) return;
      spot.current = el;
      if (!playable(step, isNarrow(), () => el !== null)) {
        dispatch('next');
        return;
      }
      if (el) await pointAt(el);
      if (state.direction === 'next') {
        for (const action of step.actions ?? []) {
          if (!alive()) return;
          await act(action);
        }
      }
      if (alive()) setReady(true);
    };
    run();
    return () => { active = false; };
  }, [step, state.direction]);

  useEffect(() => {
    if (!ready || state.paused) return;
    const timer = setTimeout(() => dispatch('next'), readMs(step.caption));
    return () => clearTimeout(timer);
  }, [ready, state.paused, step]);

  const pad = 6;
  const docked = !spotRect || isNarrow() || !cardStyle(spotRect, cardHeight);

  return (
    <div className={`tour${touch ? ' tour-touch' : ''}`}>
      <div className="tour-blocker" />
      {spotRect
        ? <div className="tour-spot" style={{left: spotRect.left - pad, top: spotRect.top - pad, width: spotRect.width + 2 * pad, height: spotRect.height + 2 * pad}} />
        : <div className="tour-dim" />}
      <div className="tour-cursor" style={{transform: `translate(${cursor.x}px, ${cursor.y}px)`}}>
        <svg viewBox="0 0 24 24" aria-hidden><path d="M4 2l16 9-7 2-3 7z" /></svg>
        <div className="tour-tap" />
        <div key={clicking} className={clicking ? 'tour-ripple tour-ripple-on' : 'tour-ripple'} />
      </div>
      <div
        ref={el => { if (el && el.offsetHeight !== cardHeight) setCardHeight(el.offsetHeight); }}
        className={`tour-card${docked ? (spotRect ? ' tour-card-docked' : ' tour-card-center') : ''}`}
        style={docked ? undefined : cardStyle(spotRect, cardHeight)}
        role="dialog"
        aria-live="polite"
      >
        <h4>{step.title}</h4>
        <p>{step.caption}</p>
        <div className="tour-ctl">
          <span className="tour-n">{state.index + 1}/{steps.length}</span>
          <button type="button" onClick={back} aria-label="Back">◀</button>
          <button type="button" onClick={() => dispatch(state.paused ? 'resume' : 'pause')} aria-label={state.paused ? 'Play' : 'Pause'}>{state.paused ? '▶' : '❚❚'}</button>
          <button type="button" onClick={() => dispatch('next')} aria-label="Next">▶▶</button>
          {!loop && <button type="button" className="tour-skip" onClick={() => dispatch('skip')}>Skip</button>}
        </div>
      </div>
    </div>
  );
}
