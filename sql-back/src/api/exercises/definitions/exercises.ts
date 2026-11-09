import type { ExerciseModel } from "./models";
import { teacherExercises } from "./teacherExercises";
import { worldExercises } from "./worldExercises";
import { worldcupExercises } from "./worldcupExercises";

// {
//   id: 1,
//   desc: '',
//   points: 1,
//   expected: [],
//   expectedOrder: false,
//   expectedColumns: ['', '']
// },

export const exercises: ExerciseModel[] = [worldExercises, teacherExercises, worldcupExercises];
