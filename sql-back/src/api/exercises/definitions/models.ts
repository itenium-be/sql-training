export type ExerciseId = "World" | "Teachers" | "Worldcup";

export type SqlExerciseModel = {
  id: number;
  desc: string;
  points: number;
  expected: any[][];
  /** Require specific array order */
  expectedOrder: boolean;
  expectedColumns: string[];
  hints?: string;
  /** Points deducted for showing the hint, default 1 */
  hintCost?: number;
  /** Points deducted for showing the expected result, default 1 */
  expectedCost?: number;
};

export type ExerciseModel = {
  id: ExerciseId;
  name: string;
  sampleQuery: string;
  desc: string;
  schema?: boolean;
  exercises: SqlExerciseModel[];
};
