import { describe, expect, test } from "bun:test";
import { referenceCost } from "./referenceCost";

describe("referenceCost", () => {
  test("measures each exercise once", async () => {
    let runs = 0;
    const measure = async () => {
      runs++;
      return 11;
    };
    expect(await referenceCost("World", 90, measure)).toBe(11);
    expect(await referenceCost("World", 90, measure)).toBe(11);
    expect(runs).toBe(1);
  });

  test("does not cache a failed measurement", async () => {
    let runs = 0;
    const measure = async () => {
      runs++;
      return null;
    };
    await referenceCost("World", 91, measure);
    await referenceCost("World", 91, measure);
    expect(runs).toBe(2);
  });
});
