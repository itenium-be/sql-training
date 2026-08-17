export type ExerciseStart = {
  player: string;
  game: string;
  exerciseId: number;
}

export type ExerciseSubmit = {
  player: string;
  game: string;
  exerciseId: number;
  solution: string;
  /** Submits it took to get here, 1 means first try. */
  attempts?: number;
  /** Whether the expected result was revealed before solving. */
  hintsUsed?: number;
  /** Blocks / logical reads the winning query needed. Lower is better. */
  reads?: number;
  plannerCost?: number;
  rowsScanned?: number;
}
