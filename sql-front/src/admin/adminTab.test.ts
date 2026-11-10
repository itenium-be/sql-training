import { describe, expect, test } from 'bun:test';
import { tabFromSearch, searchForTab, gameFromSearch, searchWith } from './adminTab';

describe('tabFromSearch', () => {
  test('reads a known tab', () => expect(tabFromSearch('?tab=exercises')).toBe('exercises'));
  test('defaults to overview without a tab', () => expect(tabFromSearch('')).toBe('overview'));
  test('defaults to overview for an unknown tab', () => expect(tabFromSearch('?tab=nope')).toBe('overview'));
});

describe('searchForTab', () => {
  test('round-trips', () => expect(tabFromSearch(searchForTab('players'))).toBe('players'));
});

describe('gameFromSearch', () => {
  test('reads the game', () => expect(gameFromSearch('?tab=exercises&game=Teachers')).toBe('Teachers'));
  test('defaults to all', () => expect(gameFromSearch('?tab=exercises')).toBe('all'));
});

describe('searchWith', () => {
  test('sets a param, keeping the others', () =>
    expect(searchWith('?tab=exercises', 'game', 'World')).toBe('?tab=exercises&game=World'));
  test('drops the param for all', () =>
    expect(searchWith('?tab=exercises&game=World', 'game', 'all')).toBe('?tab=exercises'));
});
