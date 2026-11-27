import { describe, expect, test } from 'bun:test';
import { pageTitle } from './pageTitle';

describe('pageTitle', () => {
  test('admin', () => {
    expect(pageTitle('/admin')).toBe('Admin · SQL Showdown');
    expect(pageTitle('/admin/players')).toBe('Admin · SQL Showdown');
  });

  test('beamer', () => {
    expect(pageTitle('/beamer')).toBe('Leaderboard · SQL Showdown');
  });

  test('game', () => {
    expect(pageTitle('/')).toBe('SQL Showdown · DevFest Paris');
    expect(pageTitle('/3')).toBe('SQL Showdown · DevFest Paris');
  });
});
