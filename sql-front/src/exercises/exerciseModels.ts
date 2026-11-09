export const ATTEMPTS_PER_PENALTY = 3;

export type ExerciseModel = {
  id: ExerciseId;
  name: string;
  sampleQuery: string;
  desc: string;
  schema?: boolean;
  exercises: SqlExerciseModel[];
}

export type SqlExerciseModel = {
  id: number;
  desc: string;
  points: number;
  /** Require specific array order */
  expectedOrder: boolean;
  expectedColumns: string[];
}

export type HintModel = {
  hints: string | null;
  expected: any[][];
  expectedColumns: string[];
}

export type Score = {
  player: string;
  game: string;
  exerciseid: number;
  solution?: string;
  solutionlength: number;
  /** in seconds */
  elapsed: number;
  /** Logical reads (Postgres buffers / SQL Server logical reads) */
  cost: number | null;
  /** Points awarded after hint/attempt penalties */
  points: number | null;
  hint: boolean;
  attempts: number;
}

export type ExerciseId = 'World' | 'Teachers' | 'Worldcup';
