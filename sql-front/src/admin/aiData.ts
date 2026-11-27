import { humanDuration } from './adminData';

type AiTells = {
  script: boolean;
  missingTelemetry: boolean;
  webdriver: boolean;
  unkeyed: boolean;
  hidden: boolean;
  tooQuick: boolean;
  away: boolean;
  robotic: boolean;
};

type AiExercise = {
  game: string;
  exerciseId: number;
  solveSeconds: number | null;
  charsPerSecond: number | null;
  unkeyedPct: number | null;
  awayMs: number | null;
  keyGapCv: number | null;
  client: 'browser' | 'script' | 'unknown';
};

export type AiSuspect = {
  player: string;
  id: number;
  avatar: number | null;
  disqualified: boolean;
  attempts: number;
  correct: number;
  tells: AiTells;
  nonBrowserUas: string[];
  exercises: AiExercise[];
  score: number;
};

const TELLS: [keyof AiTells, string, boolean][] = [
  ['script', 'direct API · no Sec-Fetch', true],
  ['missingTelemetry', 'no editor telemetry', true],
  ['webdriver', 'webdriver', true],
  ['unkeyed', 'pasted or inserted', true],
  ['hidden', 'typed while hidden', true],
  ['tooQuick', 'too quick', false],
  ['away', 'left the tab', false],
  ['robotic', 'robotic cadence', false],
];

export function tellBadges(s: AiSuspect): { label: string; hard: boolean }[] {
  return [
    ...TELLS.filter(([key]) => s.tells[key]).map(([, label, hard]) => ({ label, hard })),
    ...s.nonBrowserUas.map(label => ({ label, hard: true })),
  ];
}

const dash = <T,>(value: T | null, format: (v: T) => string) => (value === null ? '—' : format(value));

export function exerciseCells(e: AiExercise): string[] {
  return [
    `${e.game}#${e.exerciseId}`,
    dash(e.solveSeconds, v => humanDuration(Math.round(v))),
    dash(e.charsPerSecond, v => v.toFixed(1)),
    dash(e.unkeyedPct, v => `${v}%`),
    dash(e.awayMs, v => humanDuration(Math.round(v / 1000))),
    dash(e.keyGapCv, v => v.toFixed(2)),
    e.client,
  ];
}
