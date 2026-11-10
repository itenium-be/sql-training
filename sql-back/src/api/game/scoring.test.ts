import { describe, expect, test } from "bun:test";
import { calculatePoints } from "./scoring";

const noHelp = { hint: false, hintCost: 2, expected: false, expectedCost: 3 };

describe("calculatePoints", () => {
  test("awards base points without help or wrong attempts", () => {
    expect(calculatePoints(5, noHelp, 0)).toBe(5);
  });

  test("deducts hint and expected costs when used", () => {
    expect(calculatePoints(10, { ...noHelp, hint: true }, 0)).toBe(8);
    expect(calculatePoints(10, { ...noHelp, expected: true }, 0)).toBe(7);
    expect(calculatePoints(10, { ...noHelp, hint: true, expected: true }, 0)).toBe(5);
  });

  test("deducts one point per three wrong attempts", () => {
    expect(calculatePoints(10, noHelp, 2)).toBe(10);
    expect(calculatePoints(10, noHelp, 3)).toBe(9);
    expect(calculatePoints(10, noHelp, 7)).toBe(8);
  });

  test("never awards less than one point", () => {
    expect(calculatePoints(2, { ...noHelp, hint: true, expected: true }, 30)).toBe(1);
  });
});
