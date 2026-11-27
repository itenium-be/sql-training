import { describe, expect, test } from 'bun:test';
import { emptyTelemetry, loadTelemetry, onEdit, onKeydown, onVisibility, saveTelemetry, snapshot, TelemetryState } from './telemetry';

const key = (k: string, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }> = {}) =>
  ({ key: k, ctrlKey: false, metaKey: false, altKey: false, ...mods });

const visible = { paste: false, hidden: false };

function type(state: TelemetryState, text: string, startAt = 0, gapMs = 150): TelemetryState {
  return [...text].reduce((s, ch, i) => onEdit(onKeydown(s, key(ch), startAt + i * gapMs), 1, visible), state);
}

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() { return items.size; },
    clear: () => items.clear(),
    getItem: k => items.get(k) ?? null,
    key: index => [...items.keys()][index] ?? null,
    removeItem: k => { items.delete(k); },
    setItem: (k, value) => { items.set(k, value); },
  };
}

describe('telemetry', () => {
  test('typed characters count as keys, never as unkeyed', () => {
    const t = snapshot(type(emptyTelemetry(), 'SELECT 1'), 0, false);
    expect(t).toMatchObject({ keys: 8, unkeyedChars: 0, maxInsert: 0 });
  });

  test('a paste adds to unkeyed even after a Ctrl+V keydown', () => {
    const s = onEdit(onKeydown(emptyTelemetry(), key('v', { ctrlKey: true }), 0), 40, { paste: true, hidden: false });
    expect(snapshot(s, 0, false)).toMatchObject({ keys: 0, unkeyedChars: 40, maxInsert: 40 });
  });

  test('an insert without a keydown is unkeyed', () => {
    const s = onEdit(onEdit(emptyTelemetry(), 30, visible), 12, visible);
    expect(snapshot(s, 0, false)).toMatchObject({ unkeyedChars: 42, maxInsert: 30 });
  });

  test('one keydown covers one insert only', () => {
    const s = onEdit(onEdit(onKeydown(emptyTelemetry(), key('a'), 0), 1, visible), 50, visible);
    expect(snapshot(s, 0, false).unkeyedChars).toBe(50);
  });

  test('an accepted completion after Tab counts as keyed', () => {
    const s = onEdit(onKeydown(type(emptyTelemetry(), 'con'), key('Tab'), 1000), 9, visible);
    expect(snapshot(s, 0, false)).toMatchObject({ keys: 4, unkeyedChars: 0 });
  });

  test('AltGr characters and mobile keyboards count as keyed', () => {
    let s = onEdit(onKeydown(emptyTelemetry(), key('@', { ctrlKey: true, altKey: true }), 0), 1, visible);
    s = onEdit(onKeydown(s, key('Unidentified'), 100), 1, visible);
    expect(snapshot(s, 0, false).unkeyedChars).toBe(0);
  });

  test('an edit while hidden counts', () => {
    const s = onEdit(emptyTelemetry(), 1, { paste: false, hidden: true });
    expect(snapshot(s, 0, false).hiddenEdits).toBe(1);
  });

  test('time hidden adds up, including a hide still running', () => {
    let s = onVisibility(emptyTelemetry(), true, 1000);
    s = onVisibility(s, false, 4000);
    s = onVisibility(s, true, 10_000);
    expect(snapshot(s, 12_000, false).awayMs).toBe(5000);
  });

  test('cadence is null under 20 keys', () => {
    expect(snapshot(type(emptyTelemetry(), 'SELECT name'), 0, false).keyGapCv).toBeNull();
  });

  test('cadence is near 0 for evenly spaced keys', () => {
    const t = snapshot(type(emptyTelemetry(), 'SELECT name FROM country'), 0, false);
    expect(t.keyGapCv).toBe(0);
  });

  test('cadence ignores pauses over 2 s', () => {
    let s = type(emptyTelemetry(), 'SELECT name FROM country');
    s = type(s, 'WHERE id = 1', 60_000);
    expect(snapshot(s, 0, false).keyGapCv).toBe(0);
  });

  test('reports webdriver', () => {
    expect(snapshot(emptyTelemetry(), 0, true).webdriver).toBe(true);
  });

  test('survives a reload', () => {
    const storage = memoryStorage();
    const s = onEdit(type(emptyTelemetry(), 'SELECT'), 20, visible);
    saveTelemetry(storage, 'World', 2, s);
    expect(snapshot(loadTelemetry(storage, 'World', 2), 0, false)).toEqual(snapshot(s, 0, false));
    expect(loadTelemetry(storage, 'World', 3)).toEqual(emptyTelemetry());
  });
});
