import { Score } from '../exercises/exerciseModels';

export type MyResult = { elapsed: number; chars: number };

export function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function myExerciseResult(scores: Score[], player: string, game: string, exerciseId: number): MyResult | null {
  const mine = scores.find(s => s.player === player && s.game === game && s.exerciseid === exerciseId);
  return mine ? { elapsed: mine.elapsed, chars: mine.solutionlength } : null;
}
