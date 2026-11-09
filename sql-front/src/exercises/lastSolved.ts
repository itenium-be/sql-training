import { Score } from './exerciseModels';

export function lastSolvedQuestion(scores: Score[], player: string, game: string): number {
  const solved = scores
    .filter(s => s.player === player && s.game === game)
    .map(s => s.exerciseid);
  return solved.length ? Math.max(...solved) : 0;
}
