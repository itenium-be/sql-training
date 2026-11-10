import { describe, expect, test } from "bun:test";
import { generateOpenAPIDocument } from "./openAPIDocumentGenerator";

describe("generateOpenAPIDocument", () => {
  const doc = generateOpenAPIDocument();
  test("targets the /api prefix the proxy serves the back-end under", () =>
    expect(doc.servers).toEqual([{ url: "/api" }]));
  test("links the raw spec under /api", () => expect(doc.externalDocs?.url).toBe("/api/swagger.json"));
  test("omits the internal-only and removed endpoints", () => {
    const paths = Object.keys(doc.paths ?? {});
    for (const internal of [
      "/exercises",
      "/exercises/check",
      "/exercises/cost",
      "/exercises/hint",
      "/exercises/solutions",
    ]) {
      expect(paths).not.toContain(internal);
    }
  });
  test("every endpoint has a summary", () => {
    const missing = Object.entries(doc.paths ?? {}).flatMap(([path, ops]) =>
      Object.entries(ops as Record<string, { summary?: string }>)
        .filter(([, op]) => !op.summary)
        .map(([method]) => `${method} ${path}`),
    );
    expect(missing).toEqual([]);
  });
});
