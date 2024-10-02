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
  expected: any[][];
  /** Require specific array order */
  expectedOrder: boolean;
  expectedColumns: string[];
  hints?: string;
}

export type Score = {
  player: string;
  game: string;
  exerciseid: number;
  solution?: string;
  solutionlength: number;
  /** in seconds */
  elapsed: number;
}

export type ExerciseId = 'World' | 'Teachers' | 'Worldcup';
