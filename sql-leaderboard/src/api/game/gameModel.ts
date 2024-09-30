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
}
