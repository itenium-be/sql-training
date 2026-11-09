import { describe, expect, test } from "bun:test";
import { findExercise, penalties, toObjects } from "./checker";
import type { SqlExerciseModel } from "./definitions/models";

describe("toObjects", () => {
  test("maps rows to objects keyed by column", () => {
    expect(toObjects({ columns: ["id", "name"], rows: [[1, "Belgium"]] })).toEqual([{ id: 1, name: "Belgium" }]);
  });

  test("disambiguates duplicate and empty column names", () => {
    expect(toObjects({ columns: ["a", "a", ""], rows: [[1, 2, 3]] })).toEqual([{ a: 1, "a (2)": 2, "?column?": 3 }]);
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
