import { describe, expect, test } from 'bun:test';
import { Score } from '../exercises/exerciseModels';
import { ExerciseAward } from '../leaderboard/leaderboardData';
import { exerciseSolutions, formatClock, myExerciseResult } from './beamerData';

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

describe('exerciseSolutions', () => {
  const award = (o: Partial<ExerciseAward>): ExerciseAward => ({
    game: 'World', exerciseId: 1, desc: 'Top scorers', solvedBy: 3,
    fastest: null, shortest: null, leanest: null, ...o,
  });
  const scores: Score[] = [
    score({ player: 'wouter', solution: 'SELECT fast' }),
    score({ player: 'mehdi', solution: 'select short' }),
    score({ player: 'sofie', solution: 'SELECT lean' }),
  ];

  test('one card per holder, in fastest/shortest/leanest order, with their solution', () => {
    const a = award({ fastest: { player: 'wouter', time: 51 }, shortest: { player: 'mehdi', chars: 12 }, leanest: { player: 'sofie', reads: 4 } });
    expect(exerciseSolutions(scores, '', a)).toEqual([
      { player: 'wouter', isYou: false, tags: ['fastest'], solution: 'SELECT fast' },
      { player: 'mehdi', isYou: false, tags: ['shortest'], solution: 'select short' },
      { player: 'sofie', isYou: false, tags: ['leanest'], solution: 'SELECT lean' },
    ]);
  });

  test('a holder of two awards is one card with both tags, ordered by first award held', () => {
    const a = award({ fastest: { player: 'mehdi', time: 72 }, shortest: { player: 'wouter', chars: 10 }, leanest: { player: 'mehdi', reads: 6 } });
    expect(exerciseSolutions(scores, 'wouter', a)).toEqual([
      { player: 'mehdi', isYou: false, tags: ['fastest', 'leanest'], solution: 'select short' },
      { player: 'wouter', isYou: true, tags: ['shortest'], solution: 'SELECT fast' },
    ]);
  });

  test('marks your card isYou when you hold an award', () => {
    const a = award({ fastest: { player: 'wouter', time: 51 } });
    expect(exerciseSolutions(scores, 'wouter', a)).toEqual([
      { player: 'wouter', isYou: true, tags: ['fastest'], solution: 'SELECT fast' },
    ]);
  });

  test('appends your card last, tagless, when you solved it but hold no award', () => {
    const a = award({ fastest: { player: 'mehdi', time: 72 } });
    expect(exerciseSolutions(scores, 'wouter', a)).toEqual([
      { player: 'mehdi', isYou: false, tags: ['fastest'], solution: 'select short' },
      { player: 'wouter', isYou: true, tags: [], solution: 'SELECT fast' },
    ]);
  });

  test('no your card when you did not solve it', () => {
    const a = award({ fastest: { player: 'mehdi', time: 72 } });
    expect(exerciseSolutions(scores, 'ghost', a)).toEqual([
      { player: 'mehdi', isYou: false, tags: ['fastest'], solution: 'select short' },
    ]);
  });

  test('empty when nobody holds an award and you is blank (projector, unsolved)', () => {
    expect(exerciseSolutions(scores, '', award({}))).toEqual([]);
  });

  test('solution is empty string when the holder score has none', () => {
    const a = award({ fastest: { player: 'nosql', time: 10 } });
    expect(exerciseSolutions([...scores, score({ player: 'nosql', solution: undefined })], '', a)).toEqual([
      { player: 'nosql', isYou: false, tags: ['fastest'], solution: '' },
    ]);
  });
});
