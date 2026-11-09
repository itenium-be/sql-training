type ExerciseId = "World" | "Teachers" | "Worldcup" | "Company";

export type SqlExerciseModel = {
  id: number;
  desc: string;
  points: number;
  expected: any[][];
  /** Expected result is computed daily by running the solution (for exercises that depend on the current date) */
  dynamic?: boolean;
  /** Require specific array order */
  expectedOrder: boolean;
  expectedColumns: string[];
  /** Reference solution, only visible to the admin */
  solution: string;
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
