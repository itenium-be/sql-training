import { describe, expect, test } from "bun:test";
import { MAX_NAME_LENGTH, validateName } from "./playerName";

describe("validateName", () => {
  test("trims the name", () => {
    expect(validateName("  Ada  ")).toEqual({ name: "Ada" });
  });

  test("rejects a missing or blank name", () => {
    expect(validateName(undefined)).toEqual({ error: "Name is required" });
    expect(validateName("   ")).toEqual({ error: "Name is required" });
  });

  test("accepts a name of exactly the max length", () => {
    const name = "a".repeat(MAX_NAME_LENGTH);
    expect(validateName(name)).toEqual({ name });
  });

  test("rejects a name longer than 20 characters", () => {
    expect(MAX_NAME_LENGTH).toBe(20);
    expect(validateName("a".repeat(21))).toEqual({ error: "Name is too long (max 20 characters)" });
  });
});
