import { EditorView, ExternalChange, ViewPlugin } from '@uiw/react-codemirror';
import { loadTelemetry, onEdit, onKeydown, onVisibility, saveTelemetry, snapshot, Telemetry, TelemetryState } from './telemetry';

const states = new Map<string, TelemetryState>();
const keyOf = (game: string, exerciseId: number) => `${game}:${exerciseId}`;

function update(game: string, exerciseId: number, change: (s: TelemetryState) => TelemetryState) {
  const key = keyOf(game, exerciseId);
  const next = change(states.get(key) ?? loadTelemetry(localStorage, game, exerciseId));
  states.set(key, next);
  saveTelemetry(localStorage, game, exerciseId, next);
}

const isHidden = () => document.hidden || !document.hasFocus();

export function telemetrySnapshot(game: string, exerciseId: number): Telemetry | null {
  try {
    const s = states.get(keyOf(game, exerciseId)) ?? loadTelemetry(localStorage, game, exerciseId);
    return snapshot(s, Date.now(), navigator.webdriver === true);
  } catch {
    return null;
  }
}

export function telemetryExtension(game: string, exerciseId: number) {
  return [
    EditorView.domEventHandlers({
      keydown: e => {
        update(game, exerciseId, s => onKeydown(s, e, Date.now()));
        return false;
      },
    }),
    // The editor's value prop (draft restore, revealed solution) and undo/redo are not the player inserting text.
    EditorView.updateListener.of(u => {
      for (const tr of u.transactions) {
        if (!tr.docChanged || tr.annotation(ExternalChange) || tr.isUserEvent('undo') || tr.isUserEvent('redo')) continue;
        let inserted = 0;
        tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, text) => { inserted += text.length; });
        const paste = tr.isUserEvent('input.paste') || tr.isUserEvent('input.drop');
        update(game, exerciseId, s => onEdit(s, inserted, { paste, hidden: isHidden() }));
      }
    }),
    ViewPlugin.define(() => {
      const listener = () => update(game, exerciseId, s => onVisibility(s, document.hidden, Date.now()));
      listener();
      document.addEventListener('visibilitychange', listener);
      return {
        destroy: () => {
          document.removeEventListener('visibilitychange', listener);
          update(game, exerciseId, s => onVisibility(s, false, Date.now()));
        },
      };
    }),
  ];
}
