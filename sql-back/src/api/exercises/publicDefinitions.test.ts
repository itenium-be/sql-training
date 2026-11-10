import { describe, expect, test } from "bun:test";
import type { ExerciseModel } from "./definitions/models";
import { exerciseDetails, publicDefinitions } from "./publicDefinitions";

const games: ExerciseModel[] = [
  {
    id: "World",
    name: "World",
    sampleQuery: "SELECT 1",
    desc: "Countries of the world",
    exercises: [
      {
        id: 1,
        desc: "Big countries",
        points: 3,
        expected: [["Belgium"]],
        expectedOrder: true,
        expectedColumns: ["name"],
        solution: "SELECT name FROM countries",
        hints: "WHERE",
      },
    ],
  },
];

describe("publicDefinitions", () => {
  test("hides the question until it is revealed", () => {
    const [ex] = publicDefinitions(games, false)[0].exercises;
    expect(ex).toEqual({ id: 1, points: 3, hasHint: true, hintCost: 1, expectedCost: 1 });
  });

  test("keeps the game description public", () => {
    expect(publicDefinitions(games, false)[0].desc).toBe("Countries of the world");
  });

  test("reveals the question, but never the answer", () => {
    const [ex] = publicDefinitions(games, true)[0].exercises;
    expect(ex).toEqual({
      id: 1,
      points: 3,
      hasHint: true,
      hintCost: 1,
      expectedCost: 1,
      desc: "Big countries",
      expectedColumns: ["name"],
      expectedOrder: true,
    });
  });
});

describe("exerciseDetails", () => {
  test("returns the question of one exercise", () =>
    expect(exerciseDetails(games, "World", 1)).toEqual({
      desc: "Big countries",
      expectedColumns: ["name"],
      expectedOrder: true,
    }));

  test("is undefined for an unknown exercise", () => expect(exerciseDetails(games, "World", 99)).toBeUndefined());
});
