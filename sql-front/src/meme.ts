export const MEME_COUNT = 28;

export function memeUrl(index: number): string {
  return `/memes/sql-${index}.webp`;
}

export function nextMeme(current: number, rand: () => number = Math.random): number {
  const pick = Math.floor(rand() * (MEME_COUNT - 1)) + 1;
  return pick >= current ? pick + 1 : pick;
}
