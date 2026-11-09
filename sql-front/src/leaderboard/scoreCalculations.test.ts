import { describe, expect, test } from 'bun:test';
import { ExerciseModel, Score } from '../exercises/exerciseModels';
import { calculateEfficient, calculateFastest, calculateShortest } from './scoreCalculations';

const exercises: ExerciseModel[] = [{
  id: 'World',
  name: 'World',
  sampleQuery: '',
  desc: '',
  exercises: [
    {id: 1, desc: 'First', points: 3, expectedOrder: false, expectedColumns: [], hasHint: false, hintCost: 0, expectedCost: 1},
    {id: 2, desc: 'Second', points: 5, expectedOrder: false, expectedColumns: [], hasHint: false, hintCost: 0, expectedCost: 1},
  ],
}];

const score = (overrides: Partial<Score>): Score => ({
  player: 'alice',
  game: 'World',
  exerciseid: 1,
  solution: 'select 1',
  solutionlength: 8,
  elapsed: 60,
  cost: 10,
  points: 3,
  hint: false,
  expected: false,
  attempts: 0,
  ...overrides,
});

const scores = [
  score({player: 'alice', elapsed: 120, solutionlength: 30, cost: 5}),
  score({player: 'bob', elapsed: 30, solutionlength: 20, cost: 50}),
  score({player: 'carol', elapsed: 90, solutionlength: 40, cost: null}),
];

describe('calculateFastest', () => {
  test('picks the player with the lowest elapsed time', () => {
    const [first, second] = calculateFastest(exercises, scores);
    expect(first).toMatchObject({game: 'World', exerciseId: 1, player: 'bob', time: 30});
    expect(second).toMatchObject({exerciseId: 2, player: ''});
  });
});

describe('calculateShortest', () => {
  test('picks the shortest solution and averages lengths', () => {
    const [first] = calculateShortest(exercises, scores);
    expect(first).toMatchObject({player: 'bob', solutionLength: 20, avgLength: 30});
  });

  test('has no winner on a tie', () => {
    const [first] = calculateShortest(exercises, [score({player: 'alice'}), score({player: 'bob'})]);
    expect(first.player).toBe('');
  });
});

describe('calculateEfficient', () => {
  test('picks the lowest cost, ignoring scores without cost', () => {
    const [first] = calculateEfficient(exercises, scores);
    expect(first).toMatchObject({player: 'alice', cost: 5});
  });
});
