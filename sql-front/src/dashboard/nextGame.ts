import { ExerciseId } from '../exercises/exerciseModels';
import { GameProgress } from './dashboardSummary';

export function nextGame(games: GameProgress[], current: ExerciseId): GameProgress | null {
  const index = games.findIndex(g => g.id === current);
  return games[index + 1] ?? null;
}
