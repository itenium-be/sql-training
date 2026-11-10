import { describe, expect, test } from "bun:test";
import { parseGameMode } from "./gameMode";

describe("parseGameMode", () => {
  test("returns a stored valid mode", () => {
    expect(parseGameMode("running")).toBe("running");
    expect(parseGameMode("end")).toBe("end");
  });

  test("falls back to init when nothing is stored", () => {
    expect(parseGameMode(undefined)).toBe("init");
  });

  test("falls back to init for an unknown value", () => {
    expect(parseGameMode("paused")).toBe("init");
  });
});
