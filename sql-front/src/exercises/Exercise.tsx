import { ExerciseModel } from "./exerciseModels";
import { ExerciseSampleData } from "./ExerciseSampleData";

export function Exercise({exercise}: {exercise: ExerciseModel}) {
  return (
    <>
      <h1>{exercise.name}</h1>
      <p>{exercise.desc}</p>

      <h2>Example Data</h2>
      <pre>{exercise.sampleQuery}</pre>
      <ExerciseSampleData />

      <h2>The Exercises</h2>
    </>
  )
}
