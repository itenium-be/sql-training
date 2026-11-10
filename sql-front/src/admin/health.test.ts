import { describe, expect, test } from 'bun:test';
import { healthDown, healthFrom } from './health';

describe('healthFrom', () => {
  test('marks the leaderboard up when it answered', () =>
    expect(healthFrom({ db: true, backend: true, postgres: false, mssql: true }))
      .toEqual({ leaderboard: true, db: true, backend: true, postgres: false, mssql: true }));
});

describe('healthDown', () => {
  test('everything is down when the leaderboard does not answer', () =>
    expect(Object.values(healthDown).every(up => !up)).toBe(true));
});
