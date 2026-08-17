import { ExerciseId, ExerciseModel, SqlExerciseModel } from "../exerciseModels";
import { teacherExercises } from "./teacherExercises";
import { worldcupExercises } from "./worldcupExercises";
import { worldExercises } from "./worldExercises";

// {
//   id: 1,
//   desc: '',
//   points: 1,
//   expected: [],
//   expectedOrder: false,
//   expectedColumns: ['', '']
// },

export const exercises: ExerciseModel[] = [
  worldExercises,
  teacherExercises,
  worldcupExercises,
]

export function findGame(game: string): ExerciseModel | undefined {
  return exercises.find(ex => ex.id === game);
}

export function findExercise(game: string, exerciseId: number): SqlExerciseModel | undefined {
  return findGame(game)?.exercises.find(ex => ex.id === exerciseId);
}

export function isExerciseId(game: unknown): game is ExerciseId {
  return typeof game === 'string' && exercises.some(ex => ex.id === game);
}
