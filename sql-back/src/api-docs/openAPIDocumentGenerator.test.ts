import { describe, expect, test } from "bun:test";
import { generateOpenAPIDocument } from "./openAPIDocumentGenerator";

describe("generateOpenAPIDocument", () => {
  const doc = generateOpenAPIDocument();
  test("targets the /api prefix the proxy serves the back-end under", () =>
    expect(doc.servers).toEqual([{ url: "/api" }]));
  test("links the raw spec under /api", () => expect(doc.externalDocs?.url).toBe("/api/swagger.json"));
});
