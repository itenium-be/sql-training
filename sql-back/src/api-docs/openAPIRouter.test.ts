import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { openAPIRouter } from "./openAPIRouter";

describe("openAPIRouter", () => {
  let server: Server;
  let base: string;
  beforeAll(() => {
    server = express().use(openAPIRouter).listen(0);
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => server.close());

  test("serves Swagger UI at the root", async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Swagger UI");
  });

  test("does not answer unknown paths", async () => {
    expect((await fetch(`${base}/exercises`, { method: "POST" })).status).toBe(404);
    expect((await fetch(`${base}/nope`)).status).toBe(404);
  });
});
