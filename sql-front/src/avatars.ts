export type AvatarCharacter = {
  slug: string;
  title: string;
  tagline: string;
  variants: number;
};

// The order is the stored index space: a player's `avatar` is the 1-based
// position in the flattened variant list, so only ever append here.
// Titles come from the midjourney raw filenames; regenerate the webp with
// design/avatars/convert.sh and keep `variants` in step with the files.
export const CHARACTERS: AvatarCharacter[] = [
  { slug: 'backup-viking', title: 'Backup Viking', tagline: 'Pillages prod, keeps every backup.', variants: 8 },
  { slug: 'cache-squirrel', title: 'Cache Squirrel', tagline: 'Stashes every hot row for winter.', variants: 4 },
  { slug: 'cursor-pirate', title: 'Cursor Pirate', tagline: 'Sails row by row, plunders result sets.', variants: 4 },
  { slug: 'dba-knight', title: 'The DBA Knight', tagline: 'Shields the schema, slays the deadlock.', variants: 4 },
  { slug: 'deadlock-detective', title: 'The Deadlock Detective', tagline: "Works out who's blocking whom.", variants: 4 },
  { slug: 'dolphin-diver', title: 'The Dolphin Diver', tagline: 'Dives deep into MySQL waters.', variants: 4 },
  { slug: 'elephant-admin', title: 'The Elephant Admin', tagline: 'Never forgets a transaction.', variants: 4 },
  { slug: 'foreign-key', title: 'Foreign Key Diplomat', tagline: 'Keeps every table on speaking terms.', variants: 4 },
  { slug: 'index-ninja', title: 'The Index Ninja', tagline: 'Strikes before you hit a full scan.', variants: 4 },
  { slug: 'join-juggler', title: 'The Join Juggler', tagline: 'Keeps five tables in the air at once.', variants: 4 },
  { slug: 'primary-key', title: 'Primary Key Locksmith', tagline: 'One key, no duplicates, no copies.', variants: 4 },
  { slug: 'query-plan', title: 'Query Plan Astronaut', tagline: 'Charts the cheapest route to your rows.', variants: 4 },
  { slug: 'query-wizard', title: 'The Query Wizard', tagline: 'Conjures result sets from thin air.', variants: 6 },
  { slug: 'replication-twins', title: 'Replication Twins', tagline: 'What one writes, the other knows.', variants: 4 },
  { slug: 'schema-architect', title: 'Schema Architect', tagline: 'Draws the blueprint every table obeys.', variants: 4 },
  { slug: 'shard-golem', title: 'Shard Golem', tagline: 'Carries your data across a dozen nodes.', variants: 4 },
  { slug: 'table-scan', title: 'Table Scan Snail', tagline: 'Reads every row — eventually.', variants: 4 },
  { slug: 'the-acid', title: 'The ACID Alchemist', tagline: 'Turns chaos into committed gold.', variants: 4 },
  { slug: 'the-cartesian', title: 'The Cartesian Octopus', tagline: 'Every row, times every other row.', variants: 4 },
  { slug: 'the-coalesce', title: 'The COALESCE Chameleon', tagline: 'Never shows up as NULL.', variants: 4 },
  { slug: 'the-cte', title: 'The CTE Tree Spirit', tagline: 'Branches your query into tidy roots.', variants: 4 },
  { slug: 'the-data', title: 'The Data Lake Mermaid', tagline: 'At home in an ocean of raw data.', variants: 4 },
  { slug: 'the-distinct', title: 'The DISTINCT Peacock', tagline: 'No two feathers alike.', variants: 4 },
  { slug: 'the-drop', title: 'The DROP TABLE Daredevil', tagline: 'No WHERE clause, no fear.', variants: 4 },
  { slug: 'the-group', title: 'The GROUP BY Shepherd', tagline: 'Herds stray rows into neat flocks.', variants: 4 },
  { slug: 'the-isolation', title: 'The Isolation Astronaut', tagline: 'Commits alone, untouched by the rest.', variants: 4 },
  { slug: 'the-little', title: 'The Little Bobby Tables', tagline: "Robert'); DROP TABLE Students;--", variants: 4 },
  { slug: 'the-parisian', title: 'The Parisian SQL Artist', tagline: 'Paints queries with a certain flair.', variants: 4 },
  { slug: 'the-query', title: 'The Query Optimizer Cheetah', tagline: 'Finds the fastest path, every time.', variants: 4 },
  { slug: 'the-rollback', title: 'The Rollback Time Traveler', tagline: 'Undoes it like it never happened.', variants: 4 },
  { slug: 'the-select', title: 'The SELECT Star', tagline: 'Grabs every column, shines bright.', variants: 4 },
  { slug: 'the-server', title: 'The Server Room Phoenix', tagline: 'Rises from every crash.', variants: 4 },
  { slug: 'the-subquery', title: 'The Subquery Matryoshka', tagline: 'A query inside a query inside a…', variants: 4 },
  { slug: 'the-union', title: 'The UNION Blacksmith', tagline: 'Forges two result sets into one.', variants: 4 },
  { slug: 'transaction-samurai', title: 'Transaction Samurai', tagline: 'All or nothing. Commit or die.', variants: 4 },
  { slug: 'trigger-cowboy', title: 'Trigger Cowboy', tagline: 'Fires the moment a row moves.', variants: 4 },
  { slug: 'window-function', title: 'Window Function Owl', tagline: 'Sees each row and all its neighbours.', variants: 4 },
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
