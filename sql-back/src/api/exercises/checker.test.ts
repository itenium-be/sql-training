import { describe, expect, test } from "bun:test";
import { findExercise, grade, isCorrect, penalties, type QueryResult, type Target, toObjects } from "./checker";
import type { SqlExerciseModel } from "./definitions/models";

describe("toObjects", () => {
  test("maps rows to objects keyed by column", () => {
    expect(toObjects({ columns: ["id", "name"], rows: [[1, "Belgium"]] })).toEqual([{ id: 1, name: "Belgium" }]);
  });

  test("disambiguates duplicate and empty column names", () => {
    expect(toObjects({ columns: ["a", "a", ""], rows: [[1, 2, 3]] })).toEqual([{ a: 1, "a (2)": 2, "?column?": 3 }]);
  });
});

describe("isCorrect column names", () => {
  const exercise: SqlExerciseModel = {
    id: 1,
    desc: "",
    points: 1,
    expected: [[8]],
    expectedOrder: true,
    expectedColumns: ["count"],
    solution: "",
  };

  test("rejects correct values under the wrong column name", () => {
    expect(isCorrect(exercise, exercise.expected, { columns: ["wrong"], rows: [[8]] })).toBe(false);
  });

  test("accepts column names that differ only in case", () => {
    expect(isCorrect(exercise, exercise.expected, { columns: ["COUNT"], rows: [[8]] })).toBe(true);
  });

  test("keeps row-only comparison when no columns are expected", () => {
    expect(
      isCorrect({ ...exercise, expectedColumns: [] }, exercise.expected, { columns: ["anything"], rows: [[8]] }),
    ).toBe(true);
  });

  test("compares against the reference solution columns, not display labels", () => {
    const displayLabels = { ...exercise, expectedColumns: ["team.name", "owngoal_count"] };
    const reference = ["name", "owngoal_count"];
    expect(isCorrect(displayLabels, [[8]], { columns: reference, rows: [[8]] }, reference)).toBe(true);
    expect(isCorrect(displayLabels, [[8]], { columns: ["wrong", "owngoal_count"], rows: [[8]] }, reference)).toBe(
      false,
    );
  });
});

describe("penalties", () => {
  const exercise: SqlExerciseModel = {
    id: 1,
    desc: "",
    points: 1,
    expected: [],
    expectedOrder: false,
    expectedColumns: [],
    solution: "",
  };

  test("has no hint cost without hints and defaults expected cost", () => {
    expect(penalties(exercise)).toEqual({ hintCost: 0, expectedCost: 1 });
  });

  test("defaults hint cost when hints exist", () => {
    expect(penalties({ ...exercise, hints: "hint" })).toEqual({ hintCost: 1, expectedCost: 1 });
  });

  test("uses explicit costs", () => {
    expect(penalties({ ...exercise, hints: "hint", hintCost: 3, expectedCost: 4 })).toEqual({
      hintCost: 3,
      expectedCost: 4,
    });
  });
});

describe("findExercise", () => {
  test("finds an exercise by game and id", () => {
    expect(findExercise("World", 1)?.id).toBe(1);
  });

  test("returns undefined for unknown exercises", () => {
    expect(findExercise("World", 9999)).toBeUndefined();
    expect(findExercise("Unknown", 1)).toBeUndefined();
  });
});

describe("grade", () => {
  const exercise: SqlExerciseModel = {
    id: 1,
    desc: "",
    points: 1,
    expected: [["Mozambique"]],
    expectedOrder: false,
    expectedColumns: ["name"],
    solution: "",
  };
  const expected = { real: [["Mozambique"]], shadow: [["Mozambique"], ["Montequiaru"]] };
  const rows = (...names: string[]): QueryResult => ({ columns: ["name"], rows: names.map((n) => [n]) });

  function grader(results: Record<Target, QueryResult | Error>) {
    const ran: Target[] = [];
    return {
      ran,
      grader: {
        referenceColumns: ["name"],
        expected: async (target: Target) => expected[target],
        run: async (target: Target) => {
          ran.push(target);
          const result = results[target];
          if (result instanceof Error) {
            throw result;
          }
          return result;
        },
      },
    };
  }

  test("is correct when both the real and the shadow data match", async () => {
    const { grader: g } = grader({ real: rows("Mozambique"), shadow: rows("Mozambique", "Montequiaru") });
    expect((await grade(exercise, g)).verdict).toBe("correct");
  });

  test("is data dependent when only the real data matches, and returns the real rows", async () => {
    const { grader: g } = grader({ real: rows("Mozambique"), shadow: rows("Mozambique") });
    expect(await grade(exercise, g)).toEqual({ verdict: "dataDependent", result: rows("Mozambique") });
  });

  test("is data dependent when the query fails on the shadow data", async () => {
    const { grader: g } = grader({ real: rows("Mozambique"), shadow: new Error("Invalid object name") });
    expect((await grade(exercise, g)).verdict).toBe("dataDependent");
  });

  test("is wrong without touching the shadow data when the real data does not match", async () => {
    const { grader: g, ran } = grader({ real: rows("Belgium"), shadow: rows("Mozambique", "Montequiaru") });
    expect((await grade(exercise, g)).verdict).toBe("wrong");
    expect(ran).toEqual(["real"]);
  });
});
