import sql from "mssql";
import { executeArrayQuery, sqlConfig } from "../query";
import { measurePostgres, measureSqlServer } from "./cost";
import { exercises } from "./definitions/exercises";
import type { SqlExerciseModel } from "./definitions/models";

export class QueryError extends Error {}

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
};

export async function runQuery(game: string, query: string): Promise<QueryResult> {
  if (/statement_timeout/i.test(query)) {
    throw new QueryError("Changing statement_timeout is not allowed");
  }
  let result: QueryResult;
  if (game === "Worldcup") {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    request.arrayRowMode = true;
    const response: any = await request.query(query);
    result = {
      columns: (response.columns?.[0] ?? []).map((col: { name: string }) => col.name),
      rows: response.recordset ?? [],
    };
  } else {
    const response = await executeArrayQuery(query);
    result = {
      columns: (response.fields ?? []).map((field) => field.name),
      rows: response.rows ?? [],
    };
  }
  return JSON.parse(JSON.stringify(result));
}

export function toObjects({ columns, rows }: QueryResult): Record<string, unknown>[] {
  const seen: Record<string, number> = {};
  const keys = columns.map((col) => {
    const name = col || "?column?";
    seen[name] = (seen[name] ?? 0) + 1;
    return seen[name] === 1 ? name : `${name} (${seen[name]})`;
  });
  return rows.map((row) => Object.fromEntries(keys.map((key, i) => [key, row[i]])));
}

const DEFAULT_HINT_COST = 1;
const DEFAULT_EXPECTED_COST = 1;

export function penalties(exercise: SqlExerciseModel) {
  return {
    hintCost: exercise.hints ? (exercise.hintCost ?? DEFAULT_HINT_COST) : 0,
    expectedCost: exercise.expectedCost ?? DEFAULT_EXPECTED_COST,
  };
}

export function findExercise(game: string, exerciseId: number): SqlExerciseModel | undefined {
  return exercises.find((ex) => ex.id === game)?.exercises.find((ex) => ex.id === exerciseId);
}

function cellEquals(actual: unknown, expected: unknown) {
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return (actual ?? null) === (expected ?? null);
  }
  const actualText = String(actual);
  if (actualText === String(expected)) {
    return true;
  }
  return typeof expected === "number" && actualText.trim() !== "" && Number(actualText) === expected;
}

function rowEquals(actual: unknown[], expected: unknown[]) {
  return actual.length === expected.length && actual.every((cell, i) => cellEquals(cell, expected[i]));
}

// The reference solution result is cached once per exercise per day. Dynamic
// exercises refresh daily; static exercises reuse the cached result so the
// solution query is not re-run for every submission.
const expectedResultCache = new Map<string, QueryResult>();

function expectedResultKey(game: string, exercise: SqlExerciseModel) {
  return `${game}-${exercise.id}-${new Date().toISOString().slice(0, 10)}`;
}

async function resolveExpectedResult(game: string, exercise: SqlExerciseModel): Promise<QueryResult> {
  const key = expectedResultKey(game, exercise);
  const cached = expectedResultCache.get(key);
  if (cached) {
    return cached;
  }
  const result = await runQuery(game, exercise.solution);
  expectedResultCache.set(key, result);
  return result;
}

function normalizeCell(cell: unknown) {
  return typeof cell === "string" && /^-?\d+(\.\d+)?$/.test(cell) ? Number(cell) : cell;
}

export async function resolveExpected(game: string, exercise: SqlExerciseModel): Promise<unknown[][]> {
  if (!exercise.dynamic) {
    return exercise.expected;
  }
  const { rows } = await resolveExpectedResult(game, exercise);
  return rows.map((row) => row.map(normalizeCell));
}

// `expectedColumns` on an exercise are human-facing display labels ("team.name",
// "averga gdp") and are not always the actual column names produced by the
// reference solution. Compare submitted column names against the real columns
// of that solution instead.
export async function resolveExpectedColumns(game: string, exercise: SqlExerciseModel): Promise<string[]> {
  const { columns } = await resolveExpectedResult(game, exercise);
  return columns;
}

export function isCorrect(
  exercise: SqlExerciseModel,
  expected: unknown[][],
  { columns: actualColumns, rows: actual }: QueryResult,
  referenceColumns?: string[],
) {
  const expectedColumns = referenceColumns?.length ? referenceColumns : exercise.expectedColumns;
  if (
    expectedColumns?.length &&
    (actualColumns.length !== expectedColumns.length ||
      actualColumns.some((name, i) => name.toLowerCase() !== expectedColumns[i].toLowerCase()))
  ) {
    return false;
  }
  if (actual.length !== expected.length) {
    return false;
  }
  if (exercise.expectedOrder) {
    return actual.every((row, i) => rowEquals(row, expected[i]));
  }
  const unmatched = [...expected];
  return actual.every((row) => {
    const index = unmatched.findIndex((exp) => rowEquals(row, exp));
    if (index === -1) {
      return false;
    }
    unmatched.splice(index, 1);
    return true;
  });
}

export async function measureCost(game: string, query: string): Promise<number | null> {
  try {
    return game === "Worldcup" ? await measureSqlServer(query) : await measurePostgres(query);
  } catch (err) {
    console.warn("Could not measure cost", err);
    return null;
  }
}
