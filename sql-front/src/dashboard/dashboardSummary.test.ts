import { describe, expect, test } from 'bun:test';
import { ExerciseModel, Score } from '../exercises/exerciseModels';
import { rankPlayers } from '../leaderboard/leaderboardData';
import { dashboardSummary } from './dashboardSummary';

const ex = (id: number, points: number) =>
  ({ id, desc: '', points, expectedOrder: false, expectedColumns: [], hasHint: false, hintCost: 0, expectedCost: 1 });

const exercises: ExerciseModel[] = [
  { id: 'World', name: 'World', sampleQuery: '', desc: '', exercises: [ex(1, 3), ex(2, 5)] },
  { id: 'Teachers', name: 'Teachers', sampleQuery: '', desc: '', exercises: [ex(1, 4), ex(2, 4), ex(3, 4)] },
];

const score = (o: Partial<Score>): Score => ({
  player: 'alice', game: 'World', exerciseid: 1, solution: 'select 1', solutionlength: 20,
  elapsed: 10, cost: 5, points: 3, hint: false, expected: false, attempts: 0, ...o,
});

const scores: Score[] = [
  score({ player: 'alice', exerciseid: 1, points: 3 }),
  score({ player: 'alice', exerciseid: 2, points: 5 }),
  score({ player: 'alice', game: 'Teachers', exerciseid: 1, points: 4 }),
  score({ player: 'bob', exerciseid: 1, points: 3, elapsed: 20, solutionlength: 30, cost: 9 }),
];

describe('dashboardSummary', () => {
  test('rank and points match the leaderboard', () => {
    const rows = rankPlayers(exercises, scores);
    const bob = dashboardSummary(exercises, scores, 'bob');
    expect(bob.rank).toBe(2);
    expect(bob.players).toBe(2);
    expect(bob.points).toBe(rows[1].total);
  });

  test('solved per dataset counts only your scores in that dataset', () => {
    const alice = dashboardSummary(exercises, scores, 'alice');
    expect(alice.games).toEqual([
      { id: 'World', solved: 2, total: 2 },
      { id: 'Teachers', solved: 1, total: 3 },
    ]);
    expect(alice.solved).toBe(3);
    expect(alice.totalExercises).toBe(5);
  });

  test('a player without scores has no rank and nothing solved', () => {
    const carol = dashboardSummary(exercises, scores, 'carol');
    expect(carol.rank).toBeNull();
    expect(carol.points).toBe(0);
    expect(carol.solved).toBe(0);
    expect(carol.games.map(g => g.solved)).toEqual([0, 0]);
  });

  test('gap to next is the total difference with the player just above', () => {
    const rows = rankPlayers(exercises, scores);
    expect(dashboardSummary(exercises, scores, 'bob').gapToNext).toBe(rows[0].total - rows[1].total);
    expect(dashboardSummary(exercises, scores, 'alice').gapToNext).toBeNull();
  });

  test('matches the player name case-insensitively', () => {
    expect(dashboardSummary(exercises, scores, 'Alice').rank).toBe(1);
  });
});
