import { describe, expect, test } from 'bun:test';
import { AVATAR_COUNT, AVATARS, CHARACTERS, avatarIndexOf, avatarRef, avatarUrl } from './avatars';

describe('avatar catalog', () => {
  test('AVATAR_COUNT is the sum of every character\'s variants', () => {
    const sum = CHARACTERS.reduce((n, c) => n + c.variants, 0);
    expect(AVATAR_COUNT).toBe(sum);
    expect(AVATARS.length).toBe(sum);
  });

  test('indexes are contiguous from 1', () => {
    AVATARS.forEach((a, i) => expect(a.index).toBe(i + 1));
  });

  test('the first character owns index 1', () => {
    const first = CHARACTERS[0];
    expect(avatarUrl(1)).toBe(`/avatars/${first.slug}-1.webp`);
    expect(avatarRef(1)).toMatchObject({ slug: first.slug, variant: 1, title: first.title });
  });

  test('index rolls over into the next character after the last variant', () => {
    const first = CHARACTERS[0];
    const second = CHARACTERS[1];
    expect(avatarRef(first.variants)).toMatchObject({ slug: first.slug, variant: first.variants });
    expect(avatarRef(first.variants + 1)).toMatchObject({ slug: second.slug, variant: 1 });
  });

  test('avatarIndexOf is the inverse of avatarRef', () => {
    for (const a of AVATARS) {
      expect(avatarIndexOf(a.slug, a.variant)).toBe(a.index);
    }
  });

  test('an out-of-range index resolves to a real avatar, never undefined', () => {
    expect(avatarRef(0)).toBeDefined();
    expect(avatarRef(9999)).toBeDefined();
    expect(avatarUrl(9999)).toMatch(/^\/avatars\/.+\.webp$/);
  });
});
