import { describe, expect, test } from 'bun:test';
import { healthDown, healthFrom } from './health';

describe('healthFrom', () => {
  test('marks the API up when it answered', () =>
    expect(healthFrom({ game: true, postgres: false, mssql: true }))
      .toEqual({ api: true, game: true, postgres: false, mssql: true }));
});

describe('healthDown', () => {
  test('everything is down when the API does not answer', () =>
    expect(Object.values(healthDown).every(up => !up)).toBe(true));
});
