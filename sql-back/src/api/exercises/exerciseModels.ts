/**
 * The exercises live here, on the server, and never leave it in full.
 *
 * The answers used to sit in the frontend bundle, which meant anybody could
 * read the expected results (and the hints) straight out of the JavaScript.
 * The browser now only ever sees the "public" projections at the bottom of
 * this file: what the exercise asks and what it is worth. Nothing else.
 */

export type ExerciseId = 'World' | 'Teachers' | 'Worldcup';

export type SqlExerciseModel = {
  id: number;
  desc: string;
  points: number;
  /** The answer. Server side only. */
  expected: any[][];
  /** Require the rows to come back in this exact order. */
  expectedOrder: boolean;
  expectedColumns: string[];
  hints?: string;
}

export type ExerciseModel = {
  id: ExerciseId;
  name: string;
  sampleQuery: string;
  desc: string;
  schema?: boolean;
  exercises: SqlExerciseModel[];
}

/** What a player is allowed to know about an exercise before solving it. */
export type PublicSqlExercise = {
  id: number;
  desc: string;
  points: number;
  /** So the UI can hide the button when there is nothing extra to give. */
  hasHints: boolean;
}

export type PublicExercise = {
  id: ExerciseId;
  name: string;
  sampleQuery: string;
  desc: string;
  schema?: boolean;
  exercises: PublicSqlExercise[];
}

/** What the hint endpoint hands over once a player asks for it. */
export type ExerciseHint = {
  hints?: string;
  expected: any[][];
  expectedColumns: string[];
}

export function toPublicExercise(exercise: ExerciseModel): PublicExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    sampleQuery: exercise.sampleQuery,
    desc: exercise.desc,
    schema: exercise.schema,
    exercises: exercise.exercises.map(ex => ({
      id: ex.id,
      desc: ex.desc,
      points: ex.points,
      hasHints: !!ex.hints,
    })),
  };
}
