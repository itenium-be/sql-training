import { describe, expect, test } from 'bun:test';
import { findActivity, gaveUpExercises } from './myActivity';

const rows = [
  { game: 'World', exerciseid: 1, attempts: 2, hint: true, expected: false },
  { game: 'World', exerciseid: 2, attempts: 0, hint: false, expected: true },
  { game: 'Company', exerciseid: 1, attempts: 7, hint: false, expected: false },
];

describe('findActivity', () => {
  test('matches NUMERIC columns that pg returns as strings', () => {
    const raw = [{ game: 'World', exerciseid: '3', attempts: '4', hint: true, expected: false }];
    expect(findActivity(raw, 'World', 3)).toEqual({ hint: true, expected: false, attempts: 4 });
  });

  test('returns the row for the game and exercise', () => {
    expect(findActivity(rows, 'World', 2)).toEqual({ hint: false, expected: true, attempts: 0 });
    expect(findActivity(rows, 'Company', 1)).toEqual({ hint: false, expected: false, attempts: 7 });
  });

  test('defaults to no help used when there is no row', () => {
    expect(findActivity(rows, 'Teachers', 1)).toEqual({ hint: false, expected: false, attempts: 0 });
  });
});

describe('gaveUpExercises', () => {
  test('lists the given-up exercises, parsing NUMERIC ids', () => {
    const raw = [
      { game: 'World', exerciseid: '3', attempts: '0', hint: false, expected: false, gaveup: true },
      { game: 'World', exerciseid: '4', attempts: '0', hint: false, expected: false, gaveup: false },
      { game: 'World', exerciseid: '5', attempts: '0', hint: false, expected: false },
    ];
    expect(gaveUpExercises(raw)).toEqual([{ game: 'World', exerciseId: 3 }]);
  });
});
