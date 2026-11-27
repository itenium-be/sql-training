import { describe, expect, test } from 'bun:test';
import { loadDraft, saveDraft } from './sqlDraft';

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

describe('sqlDraft', () => {
  test('returns an empty string when nothing was typed', () => {
    expect(loadDraft(memoryStorage(), 'World', 1)).toBe('');
  });

  test('restores the sql saved for the same game and exercise', () => {
    const storage = memoryStorage();
    saveDraft(storage, 'World', 1, 'SELECT 1');
    expect(loadDraft(storage, 'World', 1)).toBe('SELECT 1');
  });

  test('keeps drafts of other exercises and games apart', () => {
    const storage = memoryStorage();
    saveDraft(storage, 'World', 1, 'SELECT 1');
    saveDraft(storage, 'World', 2, 'SELECT 2');
    saveDraft(storage, 'Teachers', 1, 'SELECT 3');
    expect(loadDraft(storage, 'World', 1)).toBe('SELECT 1');
    expect(loadDraft(storage, 'World', 2)).toBe('SELECT 2');
    expect(loadDraft(storage, 'Teachers', 1)).toBe('SELECT 3');
  });

  test('clearing the editor removes the draft', () => {
    const storage = memoryStorage();
    saveDraft(storage, 'World', 1, 'SELECT 1');
    saveDraft(storage, 'World', 1, '');
    expect(storage.length).toBe(0);
  });
});
