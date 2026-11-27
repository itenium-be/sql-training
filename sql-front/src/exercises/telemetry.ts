export type Telemetry = {
  keys: number;
  unkeyedChars: number;
  maxInsert: number;
  hiddenEdits: number;
  awayMs: number;
  keyGapCv: number | null;
  webdriver: boolean;
};

export type TelemetryState = {
  keys: number;
  unkeyedChars: number;
  maxInsert: number;
  hiddenEdits: number;
  awayMs: number;
  gaps: number[];
  lastKeyAt: number | null;
  pendingKey: boolean;
  hiddenSince: number | null;
};

type KeyEvent = { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean };

const MAX_GAPS = 200;
const MAX_GAP_MS = 2000;
const MIN_KEYS_FOR_CADENCE = 20;

export const emptyTelemetry = (): TelemetryState => ({
  keys: 0, unkeyedChars: 0, maxInsert: 0, hiddenEdits: 0, awayMs: 0,
  gaps: [], lastKeyAt: null, pendingKey: false, hiddenSince: null,
});

// AltGr reports as Ctrl+Alt on Windows, and AZERTY needs it for @ # [ ].
const isShortcut = (e: KeyEvent) => (e.ctrlKey || e.metaKey) && !e.altKey;
const isCharacter = (e: KeyEvent) => e.key.length === 1 || e.key === 'Enter' || e.key === 'Tab';
const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'CapsLock']);

export function onKeydown(s: TelemetryState, e: KeyEvent, at: number): TelemetryState {
  if (isShortcut(e) || MODIFIERS.has(e.key)) return s;
  if (!isCharacter(e)) return { ...s, pendingKey: true };
  const gap = s.lastKeyAt === null ? null : at - s.lastKeyAt;
  const gaps = gap !== null && gap <= MAX_GAP_MS ? [...s.gaps, gap].slice(-MAX_GAPS) : s.gaps;
  return { ...s, keys: s.keys + 1, gaps, lastKeyAt: at, pendingKey: true };
}

export function onEdit(s: TelemetryState, insertedChars: number, { paste, hidden }: { paste: boolean; hidden: boolean }): TelemetryState {
  const unkeyed = paste || !s.pendingKey;
  return {
    ...s,
    pendingKey: false,
    unkeyedChars: unkeyed ? s.unkeyedChars + insertedChars : s.unkeyedChars,
    maxInsert: unkeyed ? Math.max(s.maxInsert, insertedChars) : s.maxInsert,
    hiddenEdits: hidden ? s.hiddenEdits + 1 : s.hiddenEdits,
  };
}

export function onVisibility(s: TelemetryState, hidden: boolean, at: number): TelemetryState {
  if (hidden) return s.hiddenSince === null ? { ...s, hiddenSince: at } : s;
  if (s.hiddenSince === null) return s;
  return { ...s, awayMs: s.awayMs + at - s.hiddenSince, hiddenSince: null };
}

function coefficientOfVariation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (!mean) return 0;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

export function snapshot(s: TelemetryState, at: number, webdriver: boolean): Telemetry {
  return {
    keys: s.keys,
    unkeyedChars: s.unkeyedChars,
    maxInsert: s.maxInsert,
    hiddenEdits: s.hiddenEdits,
    awayMs: s.awayMs + (s.hiddenSince === null ? 0 : at - s.hiddenSince),
    keyGapCv: s.keys < MIN_KEYS_FOR_CADENCE || s.gaps.length < 2 ? null : coefficientOfVariation(s.gaps),
    webdriver,
  };
}

const storageKey = (game: string, exerciseId: number) => `sqlTelemetry:${game}:${exerciseId}`;

export function loadTelemetry(storage: Storage, game: string, exerciseId: number): TelemetryState {
  try {
    const saved = JSON.parse(storage.getItem(storageKey(game, exerciseId)) ?? 'null');
    return saved ? { ...emptyTelemetry(), ...saved, pendingKey: false, hiddenSince: null } : emptyTelemetry();
  } catch {
    return emptyTelemetry();
  }
}

export function saveTelemetry(storage: Storage, game: string, exerciseId: number, s: TelemetryState) {
  storage.setItem(storageKey(game, exerciseId), JSON.stringify({ ...s, pendingKey: false, hiddenSince: null }));
}
