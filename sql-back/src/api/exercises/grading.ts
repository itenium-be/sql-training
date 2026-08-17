import deepEqual from "deep-equal";
import type { SqlExerciseModel } from "./exerciseModels";

/**
 * Decides whether a player's result matches the expected answer.
 *
 * This used to run in the browser, which is why the answers had to be shipped
 * with it. The comparison itself is kept exactly as it was, loose equality and
 * all: the database hands back "11115" where the expected answer says 11115.
 */
export function isCorrect(exercise: SqlExerciseModel, rows: Record<string, any>[]): boolean {
  const actual = rows.map((row) => {
    const record: any[] = [];
    for (const column of Object.keys(row)) {
      record.push(row[column]?.toString());
    }
    return record;
  });

  const expected = [...exercise.expected];
  if (!exercise.expectedOrder) {
    actual.sort();
    expected.sort();
  }

  return deepEqual(actual, expected);
}
