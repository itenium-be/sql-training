import { describe, expect, test } from 'bun:test';
import { compareToLeader } from './compareToLeader';

describe('compareToLeader', () => {
  test('you hold the award', () =>
    expect(compareToLeader(59, { player: 'me', value: 59 }, 'me')).toEqual({ kind: 'best' }));

  test('same value as the holder is a tie', () =>
    expect(compareToLeader(59, { player: 'Sam', value: 59 }, 'me')).toEqual({ kind: 'tied', leader: 'Sam' }));

  test('behind the holder shows the gap', () =>
    expect(compareToLeader(64, { player: 'Sam', value: 59 }, 'me')).toEqual({ kind: 'behind', leader: 'Sam', gap: 5 }));

  test('nothing to compare without your value', () =>
    expect(compareToLeader(null, { player: 'Sam', value: 3 }, 'me')).toEqual({ kind: 'none' }));

  test('nothing to compare without a holder', () =>
    expect(compareToLeader(3, null, 'me')).toEqual({ kind: 'none' }));
});
