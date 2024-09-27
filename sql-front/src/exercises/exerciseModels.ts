export type ExerciseModel = {
  id: string;
  name: string;

}

const worldExercises: ExerciseModel = {
  id: 'World',
  name: 'Countries of the world'
}

const nobelExercises: ExerciseModel = {
  id: 'Nobel',
  name: 'Nobel Prices'
}


export const exercises = [
  worldExercises,
  nobelExercises,
]
