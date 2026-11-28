import { describe, expect, test } from 'bun:test';
import { markTutorialSeen, shouldAutoStart } from './autoStart';

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() { return items.size; },
    clear: () => items.clear(),
    getItem: key => items.get(key) ?? null,
    key: index => [...items.keys()][index] ?? null,
    removeItem: key => { items.delete(key); },
    setItem: (key, value) => { items.set(key, value); },
  };
}

describe('shouldAutoStart', () => {
  test('a registered player who has not seen the tutorial gets it', () => {
    expect(shouldAutoStart(memoryStorage(), true)).toBe(true);
  });

  test('not once it has been seen', () => {
    const storage = memoryStorage();
    markTutorialSeen(storage);
    expect(shouldAutoStart(storage, true)).toBe(false);
  });

  test('not before registering', () => {
    expect(shouldAutoStart(memoryStorage(), false)).toBe(false);
  });
});
