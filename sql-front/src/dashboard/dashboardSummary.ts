import { ExerciseId, ExerciseModel, Score } from '../exercises/exerciseModels';
import { rankPlayers } from '../leaderboard/leaderboardData';

export type GameProgress = { id: ExerciseId; solved: number; total: number; points: number };

type DashboardSummary = {
  rank: number | null;
  gapToNext: number | null;
  games: GameProgress[];
};

export function dashboardSummary(exercises: ExerciseModel[], scores: Score[], you: string): DashboardSummary {
  const isYou = (name: string) => name.toLowerCase() === you.toLowerCase();
  const rows = rankPlayers(exercises, scores);
  const index = rows.findIndex(r => isYou(r.name));
  const mine = scores.filter(s => isYou(s.player));
  const games = exercises.map(g => {
    const solved = mine.filter(s => s.game === g.id);
    return {
      id: g.id,
      solved: solved.length,
      total: g.exercises.length,
      points: solved.reduce((sum, s) => sum + (s.points ?? g.exercises.find(ex => ex.id === s.exerciseid)?.points ?? 0), 0),
    };
  });

  return {
    rank: index === -1 ? null : index + 1,
    gapToNext: index > 0 ? rows[index - 1].total - rows[index].total : null,
    games,
  };
}
