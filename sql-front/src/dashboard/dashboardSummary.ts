import { ExerciseId, ExerciseModel, Score } from '../exercises/exerciseModels';
import { rankPlayers } from '../leaderboard/leaderboardData';

type GameProgress = { id: ExerciseId; solved: number; total: number };

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
  const games = exercises.map(g => ({
    id: g.id,
    solved: mine.filter(s => s.game === g.id).length,
    total: g.exercises.length,
  }));

  return {
    rank: index === -1 ? null : index + 1,
    gapToNext: index > 0 ? rows[index - 1].total - rows[index].total : null,
    games,
  };
}
