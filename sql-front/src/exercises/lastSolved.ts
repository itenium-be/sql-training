import { Score } from './exerciseModels';

export type GaveUp = { game: string; exerciseId: number };

export function lastSolvedQuestion(scores: Score[], player: string, game: string, gaveUp: GaveUp[] = []): number {
  const done = [
    ...scores.filter(s => s.player === player && s.game === game).map(s => s.exerciseid),
    ...gaveUp.filter(g => g.game === game).map(g => g.exerciseId),
  ];
  return done.length ? Math.max(...done) : 0;
}
