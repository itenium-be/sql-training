import { GaveUp } from './lastSolved';

export type ActivityRow = { game: string; exerciseid: number | string; attempts: number | string; hint: boolean; expected: boolean; gaveup?: boolean };
export type ExerciseActivity = { hint: boolean; expected: boolean; attempts: number };

export function findActivity(rows: ActivityRow[], game: string, exerciseId: number): ExerciseActivity {
  const row = rows.find(r => r.game === game && Number(r.exerciseid) === exerciseId);
  return { hint: row?.hint ?? false, expected: row?.expected ?? false, attempts: Number(row?.attempts ?? 0) };
}

export function gaveUpExercises(rows: ActivityRow[]): GaveUp[] {
  return rows.filter(r => r.gaveup).map(r => ({ game: r.game, exerciseId: Number(r.exerciseid) }));
}
