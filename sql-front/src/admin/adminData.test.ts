import { describe, expect, test } from 'bun:test';
import { activityLevel, humanDuration, stuckRows, type AdminOverview } from './adminData';

describe('humanDuration', () => {
  test('seconds under a minute', () => {
    expect(humanDuration(0)).toBe('0s');
    expect(humanDuration(48)).toBe('48s');
    expect(humanDuration(59)).toBe('59s');
  });
  test('whole minutes, floored', () => {
    expect(humanDuration(60)).toBe('1m');
    expect(humanDuration(250)).toBe('4m');
    expect(humanDuration(3599)).toBe('59m');
  });
  test('hours with remainder minutes', () => {
    expect(humanDuration(3600)).toBe('1h');
    expect(humanDuration(3660)).toBe('1h1m');
    expect(humanDuration(7320)).toBe('2h2m');
  });
  test('null renders a dash', () => {
    expect(humanDuration(null)).toBe('—');
  });
});

describe('activityLevel', () => {
  test('null means idle (never pinged)', () => {
    expect(activityLevel(null)).toBe('idle');
  });
  test('under 30s is active', () => {
    expect(activityLevel(0)).toBe('active');
    expect(activityLevel(29)).toBe('active');
  });
  test('30s up to 5min is recent', () => {
    expect(activityLevel(30)).toBe('recent');
    expect(activityLevel(299)).toBe('recent');
  });
  test('5min or more is idle', () => {
    expect(activityLevel(300)).toBe('idle');
    expect(activityLevel(9000)).toBe('idle');
  });
});

const NOW = Date.parse('2026-11-10T20:10:00Z');
const ago = (sec: number) => new Date(NOW - sec * 1000).toISOString();

function overview(partial: Partial<AdminOverview>): AdminOverview {
  return {
    mode: 'running',
    modes: ['init', 'running', 'end'],
    players: [],
    progress: [],
    solutions: [
      { game: 'Worldcup', exerciseId: 3, desc: 'Goals per team', points: 65, solution: 'SELECT 1' },
      { game: 'Worldcup', exerciseId: 7, desc: 'Top scorer', points: 95, solution: 'SELECT 2' },
    ],
    starts: [],
    activity: [],
    submissions: [],
    ...partial,
  };
}

describe('stuckRows', () => {
  test('lists exercises started but not solved', () => {
    const o = overview({
      starts: [
        { player: 'Sam', game: 'Worldcup', exerciseid: 3, firststart: ago(100) },
        { player: 'Sam', game: 'Worldcup', exerciseid: 7, firststart: ago(250) },
      ],
      progress: [{ player: 'Sam', game: 'Worldcup', exerciseid: 3 } as AdminOverview['progress'][number]],
    });
    const rows = stuckRows('Sam', o, NOW);
    expect(rows.map(r => r.exerciseid)).toEqual([7]);
    expect(rows[0].desc).toBe('Top scorer');
  });

  test('running is measured from the earliest start, not the latest', () => {
    const o = overview({
      starts: [
        { player: 'Sam', game: 'Worldcup', exerciseid: 7, firststart: ago(250) },
      ],
    });
    expect(stuckRows('Sam', o, NOW)[0].runningSec).toBe(250);
  });

  test('wrong counts only wrong submissions and reports the most recent age', () => {
    const o = overview({
      starts: [{ player: 'Sam', game: 'Worldcup', exerciseid: 7, firststart: ago(250) }],
      submissions: [
        { id: 1, player: 'Sam', game: 'Worldcup', exerciseid: 7, correct: false, submittedat: ago(200), solution: 'x', message: 'nope' },
        { id: 2, player: 'Sam', game: 'Worldcup', exerciseid: 7, correct: false, submittedat: ago(40), solution: 'y', message: 'nope' },
        { id: 3, player: 'Sam', game: 'Worldcup', exerciseid: 7, correct: true, submittedat: ago(10), solution: 'z', message: null },
      ],
    });
    const row = stuckRows('Sam', o, NOW)[0];
    expect(row.wrong).toBe(2);
    expect(row.lastWrongSec).toBe(40);
  });

  test('last-active age comes from the activity ping, null when never pinged', () => {
    const o = overview({
      starts: [
        { player: 'Sam', game: 'Worldcup', exerciseid: 3, firststart: ago(100) },
        { player: 'Sam', game: 'Worldcup', exerciseid: 7, firststart: ago(250) },
      ],
      activity: [
        { player: 'Sam', game: 'Worldcup', exerciseid: 3, attempts: 2, lastactiveat: ago(8), hint: false, expected: false },
      ],
    });
    const byEx = Object.fromEntries(stuckRows('Sam', o, NOW).map(r => [r.exerciseid, r]));
    expect(byEx[3].lastActiveSec).toBe(8);
    expect(byEx[7].lastActiveSec).toBeNull();
  });

  test('hint and result-set reveals come from the activity row, false when never pinged', () => {
    const o = overview({
      starts: [
        { player: 'Sam', game: 'Worldcup', exerciseid: 3, firststart: ago(100) },
        { player: 'Sam', game: 'Worldcup', exerciseid: 7, firststart: ago(250) },
      ],
      activity: [
        { player: 'Sam', game: 'Worldcup', exerciseid: 3, attempts: 2, lastactiveat: ago(8), hint: true, expected: true },
      ],
    });
    const byEx = Object.fromEntries(stuckRows('Sam', o, NOW).map(r => [r.exerciseid, r]));
    expect(byEx[3].hint).toBe(true);
    expect(byEx[3].expected).toBe(true);
    expect(byEx[7].hint).toBe(false);
    expect(byEx[7].expected).toBe(false);
  });
});
