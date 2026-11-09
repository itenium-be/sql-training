import { describe, expect, test } from 'bun:test';
import { formatElapsed } from './formatElapsed';

describe('formatElapsed', () => {
  test('pads seconds under a minute', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(9)).toBe('0:09');
    expect(formatElapsed(59)).toBe('0:59');
  });

  test('rolls over into minutes', () => {
    expect(formatElapsed(60)).toBe('1:00');
    expect(formatElapsed(125)).toBe('2:05');
  });

  test('shows hours only past an hour', () => {
    expect(formatElapsed(3599)).toBe('59:59');
    expect(formatElapsed(3600)).toBe('1:00:00');
    expect(formatElapsed(3661)).toBe('1:01:01');
  });
});
