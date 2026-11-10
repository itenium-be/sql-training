import { describe, expect, test } from "bun:test";
import { shouldRecordActivity } from "./activity";

describe("shouldRecordActivity", () => {
  test("records while the game is running and the exercise is unsolved", () => {
    expect(shouldRecordActivity("running", false)).toBe(true);
  });
  test("ignores an already solved exercise", () => {
    expect(shouldRecordActivity("running", true)).toBe(false);
  });
  test("ignores pings before the game starts", () => {
    expect(shouldRecordActivity("init", false)).toBe(false);
  });
  test("ignores pings after the game ends", () => {
    expect(shouldRecordActivity("end", false)).toBe(false);
  });
});
