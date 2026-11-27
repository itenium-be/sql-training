import { describe, expect, test } from 'bun:test';
import { AiSuspect, exerciseCells, tellBadges } from './aiData';

const noTells = { script: false, missingTelemetry: false, webdriver: false, unkeyed: false, hidden: false, tooQuick: false, away: false, robotic: false };

const suspect = (overrides: Partial<AiSuspect> = {}): AiSuspect => ({
  player: 'alice', id: 1, avatar: null, disqualified: false, attempts: 3, correct: 2,
  tells: noTells, nonBrowserUas: [], exercises: [], score: 70, ...overrides,
});

describe('tellBadges', () => {
  test('hard tells are red, soft tells amber, hard first', () => {
    const badges = tellBadges(suspect({ tells: { ...noTells, tooQuick: true, script: true, unkeyed: true } }));
    expect(badges).toEqual([
      { label: 'direct API · no Sec-Fetch', hard: true },
      { label: 'pasted or inserted', hard: true },
      { label: 'too quick', hard: false },
    ]);
  });

  test('lists non-browser user agents as hard', () => {
    expect(tellBadges(suspect({ nonBrowserUas: ['curl/8.5.0'] }))).toEqual([{ label: 'curl/8.5.0', hard: true }]);
  });
});

describe('exerciseCells', () => {
  test('formats a solved exercise', () => {
    expect(exerciseCells({
      game: 'World', exerciseId: 2, solveSeconds: 95.4, charsPerSecond: 0.512, unkeyedPct: 88,
      awayMs: 125_000, keyGapCv: 0.0712, client: 'browser',
    })).toEqual(['World#2', '1m', '0.5', '88%', '2m', '0.07', 'browser']);
  });

  test('shows dashes for missing values', () => {
    expect(exerciseCells({
      game: 'World', exerciseId: 2, solveSeconds: null, charsPerSecond: null, unkeyedPct: null,
      awayMs: null, keyGapCv: null, client: 'unknown',
    })).toEqual(['World#2', '—', '—', '—', '—', '—', 'unknown']);
  });
});
