import { describe, expect, test } from 'bun:test';
import { helpLabel } from './helpLabel';

describe('helpLabel', () => {
  test('no help, no mistakes', () => expect(helpLabel({ hint: false, expected: false, attempts: 0 })).toBe('—'));
  test('lists what was used', () =>
    expect(helpLabel({ hint: true, expected: true, attempts: 2 })).toBe('hint · expected · 2 wrong'));
  test('only wrong attempts', () => expect(helpLabel({ hint: false, expected: false, attempts: 1 })).toBe('1 wrong'));
});
