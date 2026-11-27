import { describe, expect, test } from 'bun:test';
import { Score } from '../exercises/exerciseModels';
import { ExerciseAward } from '../leaderboard/leaderboardData';
import { exerciseSolutions, formatClock, solutionsVisible } from './beamerData';

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

describe('solutionsVisible', () => {
  const scores = [score({ player: 'wouter', exerciseid: 1 }), score({ player: 'mehdi', exerciseid: 2 })];
  const gaveUp = [{ game: 'World', exerciseId: 3 }, { game: 'Teachers', exerciseId: 4 }];
  const visible = (exerciseId: number, ended = false) =>
    solutionsVisible({ ended, scores, gaveUp, you: 'wouter', game: 'World', exerciseId });

  test('once you solved the exercise', () => expect(visible(1)).toBe(true));
  test('once you gave up on the exercise', () => expect(visible(3)).toBe(true));
  test('not when only someone else solved it', () => expect(visible(2)).toBe(false));
  test('not when you gave up on that id in another game', () => expect(visible(4)).toBe(false));
  test('always once the game has ended', () => expect(visible(2, true)).toBe(true));
});
