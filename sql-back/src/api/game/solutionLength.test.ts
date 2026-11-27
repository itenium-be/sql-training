import { describe, expect, test } from "bun:test";
import { solutionLength } from "./solutionLength";

describe("solutionLength", () => {
  test("ignores a trailing semicolon", () => {
    expect(solutionLength("SELECT 1;")).toBe(7);
    expect(solutionLength("SELECT 1;")).toBe(solutionLength("SELECT 1"));
  });

  test("ignores whitespace but keeps meaningful characters", () => {
    expect(solutionLength("SELECT 1")).toBe(7);
    expect(solutionLength("  SELECT   1  ")).toBe(7);
  });

  test("strips only one trailing semicolon", () => {
    expect(solutionLength("SELECT 1;;")).toBe(8);
  });
});
