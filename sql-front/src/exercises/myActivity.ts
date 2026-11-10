export type ActivityRow = { game: string; exerciseid: number | string; attempts: number | string; hint: boolean; expected: boolean };
export type ExerciseActivity = { hint: boolean; expected: boolean; attempts: number };

export function findActivity(rows: ActivityRow[], game: string, exerciseId: number): ExerciseActivity {
  const row = rows.find(r => r.game === game && Number(r.exerciseid) === exerciseId);
  return { hint: row?.hint ?? false, expected: row?.expected ?? false, attempts: Number(row?.attempts ?? 0) };
}
