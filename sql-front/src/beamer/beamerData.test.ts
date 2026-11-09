import { describe, expect, test } from 'bun:test';
import { Score } from '../exercises/exerciseModels';
import { formatClock, myExerciseResult } from './beamerData';

const score = (o: Partial<Score>): Score => ({
  player: 'alice', game: 'World', exerciseid: 1, solution: 'select 1', solutionlength: 84,
  elapsed: 112, cost: 5, points: 3, hint: false, expected: false, attempts: 0, ...o,
});

describe('formatClock', () => {
  test('minutes and zero-padded seconds', () => {
    expect(formatClock(112)).toBe('1:52');
    expect(formatClock(51)).toBe('0:51');
    expect(formatClock(184)).toBe('3:04');
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(600)).toBe('10:00');
  });
});

describe('myExerciseResult', () => {
  const scores: Score[] = [
    score({ player: 'wouter', game: 'World', exerciseid: 2, elapsed: 51, solutionlength: 97 }),
    score({ player: 'wouter', game: 'Teachers', exerciseid: 2, elapsed: 30, solutionlength: 40 }),
    score({ player: 'mehdi', game: 'World', exerciseid: 2, elapsed: 38, solutionlength: 71 }),
  ];

  test('returns the player own time and chars for the exercise', () => {
    expect(myExerciseResult(scores, 'wouter', 'World', 2)).toEqual({ elapsed: 51, chars: 97 });
  });

  test('null when the player did not solve it', () => {
    expect(myExerciseResult(scores, 'wouter', 'World', 1)).toBeNull();
    expect(myExerciseResult(scores, 'sofie', 'World', 2)).toBeNull();
  });

  test('matches the right game', () => {
    expect(myExerciseResult(scores, 'wouter', 'Teachers', 2)).toEqual({ elapsed: 30, chars: 40 });
  });
});
