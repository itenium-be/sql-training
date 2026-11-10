import { describe, expect, test } from 'bun:test';
import { formatScored } from './formatScored';

describe('formatScored', () => {
  test('shows only the points when nothing was lost', () => {
    expect(formatScored(12, 12)).toBe('Scored: 12 pts');
  });

  test('shows points out of max after penalties', () => {
    expect(formatScored(10, 12)).toBe('Scored: 10 / 12 pts');
  });
});
