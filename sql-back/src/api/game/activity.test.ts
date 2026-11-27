import { describe, expect, test } from "bun:test";
import { canSeeSolutions, shouldRecordActivity } from "./activity";

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

describe("canSeeSolutions", () => {
  test("hides solutions while the exercise is still open", () => {
    expect(canSeeSolutions("running", { solved: false, gaveUp: false })).toBe(false);
  });
  test("shows solutions once solved", () => {
    expect(canSeeSolutions("running", { solved: true, gaveUp: false })).toBe(true);
  });
  test("shows solutions once given up", () => {
    expect(canSeeSolutions("running", { solved: false, gaveUp: true })).toBe(true);
  });
  test("shows solutions to everyone once the game has ended", () => {
    expect(canSeeSolutions("end", { solved: false, gaveUp: false })).toBe(true);
  });
});
