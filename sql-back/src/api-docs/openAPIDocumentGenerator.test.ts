import { describe, expect, test } from "bun:test";
import { generateOpenAPIDocument } from "./openAPIDocumentGenerator";

describe("generateOpenAPIDocument", () => {
  const doc = generateOpenAPIDocument();
  test("targets the /api prefix the proxy serves the back-end under", () =>
    expect(doc.servers).toEqual([{ url: "/api" }]));
  test("links the raw spec under /api", () => expect(doc.externalDocs?.url).toBe("/api/swagger.json"));
  test("omits the internal-only endpoints", () => {
    const paths = Object.keys(doc.paths ?? {});
    for (const internal of ["/exercises/check", "/exercises/cost", "/exercises/hint", "/exercises/solutions"]) {
      expect(paths).not.toContain(internal);
    }
  });
});
