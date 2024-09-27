import { ExerciseModel } from "./exerciseModels";

export function Exercise({exercise}: {exercise: ExerciseModel}) {
  return (
    <>
      <h1>{exercise.name}</h1>
      <h2>Example Data</h2>
    </>
  )
}
