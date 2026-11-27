import { describe, expect, test } from 'bun:test';
import { nextGame } from './nextGame';

const games = [
  { id: 'World' as const, solved: 2, total: 2 },
  { id: 'Teachers' as const, solved: 0, total: 3 },
  { id: 'Company' as const, solved: 1, total: 5 },
];

describe('nextGame', () => {
  test('is the playground after the current one', () => {
    expect(nextGame(games, 'World')).toEqual(games[1]);
  });

  test('is null after the last playground', () => {
    expect(nextGame(games, 'Company')).toBeNull();
  });
});
