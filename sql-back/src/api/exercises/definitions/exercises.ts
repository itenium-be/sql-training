import type { ExerciseModel } from "./models";
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

export const exercises: ExerciseModel[] = [worldExercises, teacherExercises, worldcupExercises];
