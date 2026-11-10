import { describe, expect, test } from "bun:test";
import { parseGameMode, startRefusal } from "./gameMode";

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

describe("startRefusal", () => {
  test("refuses in the lobby", () => expect(startRefusal("init")).toBe("Game has not yet started!"));
  test("allows while running", () => expect(startRefusal("running")).toBeNull());
  test("allows after the end", () => expect(startRefusal("end")).toBeNull());
});
