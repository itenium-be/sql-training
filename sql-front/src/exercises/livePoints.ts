import { ATTEMPTS_PER_PENALTY, SqlExerciseModel } from './exerciseModels';

type Help = { hintUsed: boolean; expectedUsed: boolean; attempts: number };

/** Mirrors the server's calculatePoints so the badge matches what gets recorded. */
export function livePoints(sql: SqlExerciseModel, { hintUsed, expectedUsed, attempts }: Help): number {
  const helpCost = (hintUsed ? sql.hintCost : 0) + (expectedUsed ? sql.expectedCost : 0);
  return Math.max(1, sql.points - helpCost - Math.floor(attempts / ATTEMPTS_PER_PENALTY));
}
