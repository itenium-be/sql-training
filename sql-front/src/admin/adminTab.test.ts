import { describe, expect, test } from 'bun:test';
import { tabFromSearch, searchForTab } from './adminTab';

describe('tabFromSearch', () => {
  test('reads a known tab', () => expect(tabFromSearch('?tab=exercises')).toBe('exercises'));
  test('defaults to overview without a tab', () => expect(tabFromSearch('')).toBe('overview'));
  test('defaults to overview for an unknown tab', () => expect(tabFromSearch('?tab=nope')).toBe('overview'));
});

describe('searchForTab', () => {
  test('round-trips', () => expect(tabFromSearch(searchForTab('players'))).toBe('players'));
});
