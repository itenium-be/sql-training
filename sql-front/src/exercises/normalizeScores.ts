import { Score } from './exerciseModels';

const num = (v: unknown): number | null => (v === null || v === undefined ? null : +(v as number));

/** Postgres returns NUMERIC columns as strings; coerce them so comparisons and sorts work. */
export function normalizeScores(scores: Score[]): Score[] {
  return scores.map(score => ({
    ...score,
    exerciseid: +score.exerciseid,
    solutionlength: +score.solutionlength,
    elapsed: +score.elapsed,
    cost: num(score.cost),
    points: num(score.points),
    attempts: +(score.attempts ?? 0),
  }));
}
