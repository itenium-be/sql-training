import { describe, expect, test } from "bun:test";
import { parseDisqualify } from "./disqualify";

describe("parseDisqualify", () => {
  test("accepts a player name and a flag", () => {
    expect(parseDisqualify({ name: "bob", disqualified: true })).toEqual({ name: "bob", disqualified: true });
    expect(parseDisqualify({ name: "bob", disqualified: false })).toEqual({ name: "bob", disqualified: false });
  });

  test("rejects a missing name", () => {
    expect(parseDisqualify({ disqualified: true })).toHaveProperty("error");
  });

  test("rejects a non-boolean flag", () => {
    expect(parseDisqualify({ name: "bob", disqualified: "yes" })).toHaveProperty("error");
  });

  test("rejects an empty body", () => {
    expect(parseDisqualify(undefined)).toHaveProperty("error");
  });
});
