/**
 * Everything the browser is allowed to know.
 *
 * The expected results and the hints deliberately are not here: they live in
 * sql-back and only ever arrive one exercise at a time, when the player asks
 * for a hint. Otherwise the answers would sit in the bundle for anyone to read.
 */

export type SqlExerciseModel = {
  id: number;
  desc: string;
  points: number;
  /** Whether this exercise has hint text on top of the expected result. */
  hasHints: boolean;
}

export type ExerciseModel = {
  id: ExerciseId;
  name: string;
  sampleQuery: string;
  desc: string;
  schema?: boolean;
  exercises: SqlExerciseModel[];
}

/** Fetched from the backend when the player asks for a hint. */
export type ExerciseHint = {
  hints?: string;
  expected: unknown[][];
  expectedColumns: string[];
}

/**
 * One solved exercise. Field names are lowercase because that is how
 * postgres hands back unquoted column names.
 */
export type Score = {
  player: string;
  game: string;
  exerciseid: number;
  solution?: string;
  solutionlength: number;
  /** in seconds */
  elapsed: number;
  /** Submits needed to get it right, 1 means first try. */
  attempts: number;
  /** 0 when solved without revealing the expected result. */
  hintsused: number;
  /** Blocks / logical reads the query needed. Lower is better, and it does
   * not care how busy the server was when you ran it. */
  reads: number;
  plannercost: number;
  rowsscanned: number;
}

export type ExerciseId = 'World' | 'Teachers' | 'Worldcup';
