export const MEME_COUNT = 18;

export function memeUrl(index: number): string {
  return `/memes/sql-${index}.png`;
}

export function nextMeme(current: number, rand: () => number = Math.random): number {
  const pick = Math.floor(rand() * (MEME_COUNT - 1)) + 1;
  return pick >= current ? pick + 1 : pick;
}
