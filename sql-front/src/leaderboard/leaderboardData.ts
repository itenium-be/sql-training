import { ExerciseModel, ExerciseId, Score } from "../exercises/exerciseModels";
import { calculateEfficient, calculateFastest, calculateShortest } from "./scoreCalculations";

export const AWARD_BONUS = 6;

export type PlayerRow = {
  name: string;
  points: number;
  solved: number;
  totalExercises: number;
  fastest: number;
  shortest: number;
  leanest: number;
  total: number;
};

export type ExerciseAward = {
  game: string;
  exerciseId: number;
  desc: string;
  solvedBy: number;
  fastest: { player: string; time: number } | null;
  shortest: { player: string; chars: number } | null;
  leanest: { player: string; reads: number } | null;
};

function exercisePoints(exercises: ExerciseModel[]): Record<string, number> {
  const points: Record<string, number> = {};
  exercises.forEach(game => game.exercises.forEach(ex => { points[`${game.id}-${ex.id}`] = ex.points; }));
  return points;
}

export function rankPlayers(exercises: ExerciseModel[], scores: Score[], game?: ExerciseId): PlayerRow[] {
  const inScope = game ? scores.filter(s => s.game === game) : scores;
  const points = exercisePoints(exercises);
  const totalExercises = exercises
    .filter(g => !game || g.id === game)
    .reduce((n, g) => n + g.exercises.length, 0);

  const fastestTable = calculateFastest(exercises, scores).filter(a => !game || a.game === game);
  const shortestTable = calculateShortest(exercises, scores).filter(a => !game || a.game === game);
  const leanestTable = calculateEfficient(exercises, scores).filter(a => !game || a.game === game);

  const names = [...new Set(inScope.map(s => s.player))];
  return names.map(name => {
    const mine = inScope.filter(s => s.player === name);
    const scored = mine.reduce((sum, s) => sum + (s.points ?? points[`${s.game}-${s.exerciseid}`] ?? 0), 0);
    const fastest = fastestTable.filter(a => a.player === name).length;
    const shortest = shortestTable.filter(a => a.player === name).length;
    const leanest = leanestTable.filter(a => a.player === name).length;
    return {
      name,
      points: scored,
      solved: mine.length,
      totalExercises,
      fastest,
      shortest,
      leanest,
      total: scored + (fastest + shortest + leanest) * AWARD_BONUS,
    };
  }).sort((a, b) => b.total - a.total);
}

export function exerciseAwards(exercises: ExerciseModel[], scores: Score[], game: ExerciseId): ExerciseAward[] {
  const fastestTable = calculateFastest(exercises, scores);
  const shortestTable = calculateShortest(exercises, scores);
  const leanestTable = calculateEfficient(exercises, scores);
  const gameModel = exercises.find(g => g.id === game);
  if (!gameModel) {
    return [];
  }

  return gameModel.exercises.map(ex => {
    const fastest = fastestTable.find(a => a.game === game && a.exerciseId === ex.id);
    const shortest = shortestTable.find(a => a.game === game && a.exerciseId === ex.id);
    const leanest = leanestTable.find(a => a.game === game && a.exerciseId === ex.id);
    return {
      game,
      exerciseId: ex.id,
      desc: ex.desc,
      solvedBy: scores.filter(s => s.game === game && s.exerciseid === ex.id).length,
      fastest: fastest?.player ? { player: fastest.player, time: fastest.time } : null,
      shortest: shortest?.player ? { player: shortest.player, chars: shortest.solutionLength } : null,
      leanest: leanest?.player ? { player: leanest.player, reads: leanest.cost } : null,
    };
  });
}
