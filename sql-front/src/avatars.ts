export type AvatarCharacter = {
  slug: string;
  title: string;
  tagline: string;
  variants: number;
};

// The order is the stored index space: a player's `avatar` is the 1-based
// position in the flattened variant list, so only ever append here.
export const CHARACTERS: AvatarCharacter[] = [
  { slug: 'query-wizard', title: 'The Query Wizard', tagline: 'Conjures result sets from thin air.', variants: 6 },
  { slug: 'dba-knight', title: 'The DBA Knight', tagline: 'Shields the schema, slays the deadlock.', variants: 4 },
  { slug: 'deadlock-detective', title: 'The Deadlock Detective', tagline: "Works out who's blocking whom.", variants: 4 },
  { slug: 'index-ninja', title: 'The Index Ninja', tagline: 'Strikes before you hit a full scan.', variants: 4 },
  { slug: 'join-juggler', title: 'The Join Juggler', tagline: 'Keeps five tables in the air at once.', variants: 4 },
  { slug: 'elephant-admin', title: 'The Elephant Admin', tagline: 'Never forgets a transaction.', variants: 4 },
  { slug: 'dolphin-diver', title: 'The Dolphin Diver', tagline: 'Dives deep into MySQL waters.', variants: 2 },
];

export type AvatarRef = {
  index: number;
  slug: string;
  title: string;
  tagline: string;
  variant: number;
};

export const AVATARS: AvatarRef[] = CHARACTERS.flatMap(c =>
  Array.from({ length: c.variants }, (_, v) => ({
    index: 0,
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    variant: v + 1,
  })),
).map((a, i) => ({ ...a, index: i + 1 }));

export const AVATAR_COUNT = AVATARS.length;

export function avatarRef(index: number): AvatarRef {
  const i = ((Math.trunc(index) - 1) % AVATAR_COUNT + AVATAR_COUNT) % AVATAR_COUNT;
  return AVATARS[i];
}

export function avatarUrl(index: number): string {
  const a = avatarRef(index);
  return `/avatars/${a.slug}-${a.variant}.webp`;
}

export function avatarIndexOf(slug: string, variant: number): number {
  return AVATARS.find(a => a.slug === slug && a.variant === variant)?.index ?? 1;
}
