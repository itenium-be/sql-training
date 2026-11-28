import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { closeCompletion } from '@codemirror/autocomplete';
import { Action, Step } from './steps';
import { actionsBefore, anchorFor, catchUp, initialTour, playable, Target, tour, TourEvent } from './tourEngine';
import './tutorial.css';

const NARROW = '(max-width: 1100px)';
const TOUCH = '(pointer: coarse)';
const MOVE_MS = 800;
const ANCHOR_WAIT_MS = 3000;
const TYPE_MS = 25;
// Lets React commit a replayed click or edit before the next one reads the page.
const REPLAY_MS = 100;
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

async function typeInto(el: HTMLElement, text: string, alive: () => boolean, instant: boolean) {
  const editor = el.querySelector<HTMLElement>('.cm-editor');
  const view = editor && EditorView.findFromDOM(editor);
  if (!view) return;
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: instant ? text : '' } });
  for (let i = 0; !instant && i < text.length && alive(); i++) {
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

type TourPlayerProps = {
  steps: Step[];
  loop: boolean;
  onEnd: () => void;
  /** Resets the demo app to its first screen, so Back can replay the steps before it. */
  onRewind: () => void;
};

export function TourPlayer({steps, loop, onEnd, onRewind}: TourPlayerProps) {
  const [state, dispatch] = useReducer((s: typeof initialTour, e: TourEvent) => tour(s, e, steps.length), initialTour);
  const spot = useRef<HTMLElement | null>(null);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);
  const [cursor, setCursor] = useState<{x: number, y: number}>({x: window.innerWidth / 2, y: window.innerHeight / 2});
  const [clicking, setClicking] = useState(0);
  const [cardHeight, setCardHeight] = useState(160);
  const step = steps[state.index];
  const actions = useMemo(() => steps.flatMap(s => [...(s.enter ?? []), ...(s.actions ?? [])]), [steps]);
  /** How many of `actions` the demo on screen has run. */
  const applied = useRef(0);
  const touch = window.matchMedia(TOUCH).matches;

  useEffect(() => {
    if (state.ended) onEnd();
  }, [state.ended, onEnd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loop) dispatch('skip');
      if (e.key === 'ArrowRight') dispatch('next');
      if (e.key === 'ArrowLeft') dispatch('back');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loop]);

  useEffect(() => {
    // A spotlit element that leaves the page (the hint button becoming the hint) keeps its last box rather than jumping to 0,0.
    const timer = setInterval(() => setSpotRect(prev => spot.current && (spot.current.isConnected ? rectOf(spot.current) : prev)), 100);
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
    /** False when interrupted before taking effect, e.g. a half-typed query. An action whose anchor never shows is skipped, as in normal play. */
    const act = async (action: Action, replay: boolean): Promise<boolean> => {
      const el = await waitFor(action, alive);
      if (!el) return alive();
      if (!replay) await pointAt(el);
      if (!alive()) return false;
      if (action.do === 'type') {
        await typeInto(el, action.text, alive, replay);
        return alive();
      }
      if (!replay) setClicking(c => c + 1);
      el.click();
      return true;
    };

    const run = async () => {
      const target = actionsBefore(steps, state.index);
      const { reset, from } = catchUp(applied.current, target);
      spot.current = null;
      if (reset) {
        onRewind();
        applied.current = 0;
        await sleep(REPLAY_MS);
      }
      for (let i = from; i < target; i++) {
        if (!await act(actions[i], true)) return;
        applied.current = i + 1;
        await sleep(REPLAY_MS);
      }
      const enter = step.enter ?? [];
      for (const [i, action] of enter.entries()) {
        if (!await act(action, false)) return;
        applied.current = target + i + 1;
        await sleep(700);
      }
      const el = step.anchor ? await waitFor(step, alive) : null;
      if (!alive()) return;
      spot.current = el;
      if (!playable(step, isNarrow(), () => el !== null)) {
        dispatch(state.direction);
        return;
      }
      if (el) await pointAt(el);
      for (const [i, action] of (step.actions ?? []).entries()) {
        if (!await act(action, false)) return;
        applied.current = target + enter.length + i + 1;
        await sleep(700);
      }
    };
    run();
    return () => { active = false; };
  }, [steps, actions, step, state.index, state.direction, onRewind]);

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
          <button type="button" onClick={() => dispatch('back')} disabled={state.index === 0} aria-label="Back">◀</button>
          <button type="button" onClick={() => dispatch('next')} aria-label="Next">▶</button>
          {!loop && <button type="button" className="tour-skip" onClick={() => dispatch('skip')}>Skip</button>}
        </div>
      </div>
    </div>
  );
}
