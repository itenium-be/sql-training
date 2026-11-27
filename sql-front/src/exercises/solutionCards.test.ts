import { describe, expect, test } from 'bun:test';
import { withSolutions } from './solutionCards';
import { Score } from './exerciseModels';

const score = (player: string, game: string, exerciseid: number): Score => ({
  player, game, exerciseid,
  solutionlength: 0, elapsed: 0, cost: null, points: null, hint: false, expected: false, attempts: 0,
});

describe('withSolutions', () => {
  const scores = [score('alice', 'World', 1), score('bob', 'World', 1), score('alice', 'World', 2)];
  const solutions = [{player: 'alice', solution: 'SELECT 1'}, {player: 'bob', solution: 'SELECT 2'}];

  test('fills in the solution text of that exercise', () => {
    const filled = withSolutions(scores, 'World', 1, solutions);
    expect(filled.map(s => s.solution)).toEqual(['SELECT 1', 'SELECT 2', undefined]);
  });

  test('leaves other exercises alone', () => {
    expect(withSolutions(scores, 'World', 1, solutions)[2]).toBe(scores[2]);
  });
});
