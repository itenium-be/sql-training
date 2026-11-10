import { describe, expect, test } from 'bun:test';
import { shouldPing, PING_THROTTLE_MS } from './activityPing';

describe('shouldPing', () => {
  test('pings when never pinged before', () => {
    expect(shouldPing(null, 1_000)).toBe(true);
  });
  test('does not ping again within the throttle window', () => {
    expect(shouldPing(1_000, 1_000 + PING_THROTTLE_MS - 1)).toBe(false);
  });
  test('pings again once the throttle window has passed', () => {
    expect(shouldPing(1_000, 1_000 + PING_THROTTLE_MS)).toBe(true);
  });
});
