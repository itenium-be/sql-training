import { describe, expect, test } from 'bun:test';
import { ExerciseModel, Score } from '../exercises/exerciseModels';
import { AWARD_BONUS, awardLabel, exerciseAwards, rankPlayers } from './leaderboardData';

const exercises: ExerciseModel[] = [{
  id: 'World',
  name: 'World',
  sampleQuery: '',
  desc: '',
  exercises: [
    { id: 1, desc: 'First', points: 3, expectedOrder: false, expectedColumns: [], hasHint: false, hintCost: 0, expectedCost: 1 },
    { id: 2, desc: 'Second', points: 5, expectedOrder: false, expectedColumns: [], hasHint: false, hintCost: 0, expectedCost: 1 },
  ],
}];

const score = (o: Partial<Score>): Score => ({
  player: 'alice', game: 'World', exerciseid: 1, solution: 'select 1', solutionlength: 20,
  elapsed: 10, cost: 5, points: 3, hint: false, expected: false, attempts: 0, ...o,
});

const scores: Score[] = [
  score({ player: 'alice', exerciseid: 1, elapsed: 10, solutionlength: 20, cost: 5, points: 3 }),
  score({ player: 'bob', exerciseid: 1, elapsed: 20, solutionlength: 15, cost: 8, points: 3 }),
  score({ player: 'alice', exerciseid: 2, elapsed: 5, solutionlength: 30, cost: 10, points: 5 }),
];

describe('rankPlayers', () => {
  const rows = rankPlayers(exercises, scores);

  test('ranks by total descending', () => {
    expect(rows.map(r => r.name)).toEqual(['alice', 'bob']);
  });

  test('aggregates points, solved and award counts', () => {
    const alice = rows[0];
    expect(alice.points).toBe(8);
    expect(alice.solved).toBe(2);
    expect(alice.totalExercises).toBe(2);
    expect(alice.fastest).toBe(2);
    expect(alice.shortest).toBe(1);
    expect(alice.leanest).toBe(2);
    expect(alice.total).toBe(8 + (2 + 1 + 2) * AWARD_BONUS);
  });

  test('bob holds the shortest award on the contested exercise', () => {
    expect(rows[1].shortest).toBe(1);
  });
});

describe('exerciseAwards', () => {
  const awards = exerciseAwards(exercises, scores, 'World');

  test('one row per exercise with solve counts', () => {
    expect(awards.map(a => a.exerciseId)).toEqual([1, 2]);
    expect(awards[0].solvedBy).toBe(2);
    expect(awards[1].solvedBy).toBe(1);
  });

  test('names the award holders', () => {
    expect(awards[0].fastest?.player).toBe('alice');
    expect(awards[0].shortest?.player).toBe('bob');
    expect(awards[0].leanest?.player).toBe('alice');
  });
});

describe('awardLabel', () => {
  test('shows the question when it is known', () =>
    expect(awardLabel({ exerciseId: 3, desc: 'Big countries' })).toBe('#3 · Big countries'));
  test('shows only the number while the question is hidden', () =>
    expect(awardLabel({ exerciseId: 3 })).toBe('#3'));
});
