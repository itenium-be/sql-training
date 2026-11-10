import { describe, expect, test } from "bun:test";
import { isUp } from "./isUp";

describe("isUp", () => {
  test("true when the probe resolves", async () => expect(await isUp(async () => 1)).toBe(true));
  test("false when the probe rejects", async () =>
    expect(
      await isUp(async () => {
        throw new Error("down");
      }),
    ).toBe(false));
});
