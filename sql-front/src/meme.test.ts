import { describe, expect, test } from 'bun:test';
import { MEME_COUNT, memeUrl, nextMeme } from './meme';

describe('nextMeme', () => {
  test('never returns the current meme', () => {
    for (let current = 1; current <= MEME_COUNT; current++) {
      for (const r of [0, 0.25, 0.5, 0.999]) {
        expect(nextMeme(current, () => r)).not.toBe(current);
      }
    }
  });

  test('stays within 1..MEME_COUNT', () => {
    for (const r of [0, 0.5, 0.999]) {
      const m = nextMeme(9, () => r);
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(MEME_COUNT);
    }
  });

  test('reaches every other meme as rand sweeps', () => {
    const current = 3;
    const seen = new Set<number>();
    for (let i = 0; i < MEME_COUNT - 1; i++) {
      seen.add(nextMeme(current, () => i / (MEME_COUNT - 1)));
    }
    expect(seen.size).toBe(MEME_COUNT - 1);
    expect(seen.has(current)).toBe(false);
  });
});

describe('memeUrl', () => {
  test('maps an index to its asset path', () => {
    expect(memeUrl(7)).toBe('/memes/sql-7.webp');
  });
});
