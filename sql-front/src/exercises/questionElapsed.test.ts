import { describe, expect, test } from 'bun:test';
import { originFromElapsed, secondsSince } from './questionElapsed';

describe('originFromElapsed', () => {
  test('a fresh question originates now', () => {
    expect(originFromElapsed(0, 1_000_000)).toBe(1_000_000);
  });

  test('a question seen earlier originates that many seconds before now', () => {
    expect(originFromElapsed(42, 1_000_000)).toBe(1_000_000 - 42_000);
  });
});

describe('secondsSince', () => {
  test('counts whole seconds from the origin', () => {
    expect(secondsSince(1_000_000, 1_000_000)).toBe(0);
    expect(secondsSince(1_000_000, 1_009_900)).toBe(9);
  });

  test('keeps counting across a return to the question', () => {
    const origin = originFromElapsed(42, 1_000_000);
    expect(secondsSince(origin, 1_003_000)).toBe(45);
  });
});
