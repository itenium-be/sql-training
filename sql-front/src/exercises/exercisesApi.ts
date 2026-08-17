import { config, HttpResponse, QueryResponse } from "../config";
import { ExerciseHint, ExerciseId, ExerciseModel } from "./exerciseModels";

async function post<T>(path: string, body: unknown): Promise<HttpResponse<T>> {
  const res = await fetch(`${config.api}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** The catalogue: what each exercise asks and what it is worth. No answers. */
export async function fetchExercises(): Promise<ExerciseModel[]> {
  const res = await fetch(`${config.api}/exercises`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data: HttpResponse<ExerciseModel[]> = await res.json();
  return data.success ? data.responseObject : [];
}

export type Identity = {
  player: string;
  game: ExerciseId;
  exerciseId: number;
}

/**
 * Runs the SQL. The server grades it, counts the attempt and, when it is
 * right, reports the score to the leaderboard itself.
 */
export function runExercise(identity: Identity, sql: string) {
  return post<QueryResponse>('/exercises', {...identity, sql});
}

/** Asking costs you the no-hints bonus, which is why the server hands it out. */
export function fetchHint(identity: Identity) {
  return post<ExerciseHint>('/exercises/hint', identity);
}

/** Starts the clock for this exercise. */
export async function startExercise(identity: Identity): Promise<void> {
  await fetch(`${config.leaderboard.api}/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(identity),
  });
}
