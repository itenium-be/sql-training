import { Score } from './exerciseModels';

export type PlayerSolution = { player: string; solution: string };

export function withSolutions(scores: Score[], game: string, exerciseId: number, solutions: PlayerSolution[]): Score[] {
  return scores.map(s => s.game === game && s.exerciseid === exerciseId
    ? {...s, solution: solutions.find(x => x.player === s.player)?.solution}
    : s);
}
