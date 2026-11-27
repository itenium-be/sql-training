import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import {
  findExercise,
  grade,
  grader,
  measureCost,
  penalties,
  QueryError,
  resolveExpected,
  resolveExpectedColumns,
  toObjects,
  type Verdict,
} from "./checker";
import { exercises } from "./definitions/exercises";

export type CheckResult = {
  correct: boolean;
  points: number;
  hintCost: number;
  expectedCost: number;
  cost: number | null;
  rows: Record<string, unknown>[];
};

const VERDICT_MESSAGES: Record<Verdict, string> = {
  correct: "Correct",
  wrong: "Query result does not match expected output!",
  dataDependent: "Right result, but your query wouldn't give the right result on other data.",
};

export type HintResult = {
  hints?: string;
  expected?: unknown[][];
  expectedColumns?: string[];
};

export async function checkSolution(
  game: string,
  exerciseId: number,
  query: string,
): Promise<ServiceResponse<CheckResult | null>> {
  const exercise = findExercise(game, exerciseId);
  if (!exercise) {
    return ServiceResponse.failure(`Unknown exercise ${game}-${exerciseId}`, null, StatusCodes.NOT_FOUND);
  }
  try {
    const referenceColumns = await resolveExpectedColumns(game, exercise);
    const { verdict, result } = await grade(exercise, grader(game, exercise, query, referenceColumns));
    const correct = verdict === "correct";
    const rows = toObjects(result);
    const cost = correct ? await measureCost(game, query) : null;
    return ServiceResponse.success<CheckResult | null>(VERDICT_MESSAGES[verdict], {
      correct,
      cost,
      rows,
      points: exercise.points,
      ...penalties(exercise),
    });
  } catch (err: any) {
    const status = err instanceof QueryError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
    return ServiceResponse.failure(err.message, null, status);
  }
}

export async function exerciseHint(
  game: string,
  exerciseId: number,
  type: "hint" | "expected",
): Promise<ServiceResponse<HintResult | null>> {
  const exercise = findExercise(game, exerciseId);
  if (!exercise) {
    return ServiceResponse.failure("Unknown exercise", null, StatusCodes.NOT_FOUND);
  }
  if (type === "expected") {
    try {
      const expected = await resolveExpected(game, exercise);
      return ServiceResponse.success<HintResult | null>("Expected result", {
        expected,
        expectedColumns: exercise.expectedColumns,
      });
    } catch (err: any) {
      return ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  if (!exercise.hints) {
    return ServiceResponse.failure("This exercise has no hint", null, StatusCodes.NOT_FOUND);
  }
  return ServiceResponse.success<HintResult | null>("Hint", { hints: exercise.hints });
}

export function referenceSolutions() {
  return exercises.flatMap((game) =>
    game.exercises.map((ex) => ({
      game: game.id,
      exerciseId: ex.id,
      desc: ex.desc,
      points: ex.points,
      solution: ex.solution,
    })),
  );
}

export function referenceSolution(game: string, exerciseId: number): string | undefined {
  return exercises.find((g) => g.id === game)?.exercises.find((ex) => ex.id === exerciseId)?.solution;
}
