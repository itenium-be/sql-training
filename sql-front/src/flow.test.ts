import { describe, expect, test } from 'bun:test';
import { screenFor } from './flow';

describe('screenFor', () => {
  test('newcomer sees the intro until they start', () => {
    expect(screenFor(null, false, false)).toBe('intro');
    expect(screenFor('init', false, false)).toBe('intro');
    expect(screenFor('running', false, false)).toBe('intro');
  });

  test('starting without a name leads to register', () => {
    expect(screenFor('init', false, true)).toBe('register');
    expect(screenFor('running', false, true)).toBe('register');
  });

  test('registered waits while the lobby is open', () => {
    expect(screenFor('init', true, false)).toBe('waiting');
    expect(screenFor('init', true, true)).toBe('waiting');
  });

  test('registered enters the game once it is live', () => {
    expect(screenFor('running', true, false)).toBe('game');
    expect(screenFor('end', true, true)).toBe('game');
  });

  test('unknown mode never drops anyone into the game', () => {
    expect(screenFor(null, true, false)).toBe('waiting');
  });
});
