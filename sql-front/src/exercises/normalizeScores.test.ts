import { describe, expect, test } from 'bun:test';
import { normalizeScores } from './normalizeScores';

describe('normalizeScores', () => {
  test('coerces the numeric columns Postgres returns as strings', () => {
    const [s] = normalizeScores([
      { player: 'A', game: 'World', exerciseid: '7', solutionlength: '42', elapsed: '51', cost: '6', points: '80', hint: false, expected: false, attempts: '2' } as never,
    ]);
    expect(s.exerciseid).toBe(7);
    expect(s.solutionlength).toBe(42);
    expect(s.elapsed).toBe(51);
    expect(s.cost).toBe(6);
    expect(s.points).toBe(80);
    expect(s.attempts).toBe(2);
  });

  test('keeps null cost and points as null', () => {
    const [s] = normalizeScores([
      { player: 'A', game: 'World', exerciseid: '1', solutionlength: '10', elapsed: '5', cost: null, points: null, hint: false, expected: false, attempts: '0' } as never,
    ]);
    expect(s.cost).toBeNull();
    expect(s.points).toBeNull();
  });

  test('defaults missing attempts to 0', () => {
    const [s] = normalizeScores([
      { player: 'A', game: 'World', exerciseid: '1', solutionlength: '10', elapsed: '5', cost: '1', points: '1', hint: false, expected: false } as never,
    ]);
    expect(s.attempts).toBe(0);
  });
});
