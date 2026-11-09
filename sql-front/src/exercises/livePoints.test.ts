import { describe, expect, test } from 'bun:test';
import { livePoints } from './livePoints';
import { SqlExerciseModel } from './exerciseModels';

const sql = (over: Partial<SqlExerciseModel> = {}): SqlExerciseModel => ({
  id: 1, desc: '', points: 5, expectedOrder: false, expectedColumns: [],
  hasHint: true, hintCost: 1, expectedCost: 2, ...over,
});

const none = { hintUsed: false, expectedUsed: false, attempts: 0 };

describe('livePoints', () => {
  test('full points with no help and no wrong attempts', () => {
    expect(livePoints(sql(), none)).toBe(5);
  });

  test('subtracts the hint cost', () => {
    expect(livePoints(sql(), { ...none, hintUsed: true })).toBe(4);
  });

  test('subtracts the expected cost', () => {
    expect(livePoints(sql(), { ...none, expectedUsed: true })).toBe(3);
  });

  test('stacks hint, expected and attempt penalties', () => {
    expect(livePoints(sql(), { hintUsed: true, expectedUsed: true, attempts: 3 })).toBe(1);
  });

  test('one penalty per three wrong attempts', () => {
    expect(livePoints(sql({ points: 9 }), { ...none, attempts: 7 })).toBe(7);
  });

  test('never drops below one', () => {
    expect(livePoints(sql({ points: 2 }), { hintUsed: true, expectedUsed: true, attempts: 6 })).toBe(1);
  });
});
