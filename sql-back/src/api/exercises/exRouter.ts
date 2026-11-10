import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { exController } from "./exController";

export const exRegistry = new OpenAPIRegistry();
export const exRouter: Router = express.Router();

exRegistry.registerPath({
  method: "post",
  path: "/exercises/validate",
  summary: "Syntax-check a query without running it",
  description:
    "Postgres: EXPLAIN; SQL Server: sp_describe_first_result_set. Returns editor diagnostics (message plus position) for the squiggles while typing; an empty array means the query parses.",
  tags: ["Exercises"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            sql: { type: "string" },
            game: { type: "string" },
          },
          required: ["sql", "game"],
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({ message: z.string(), from: z.number(), to: z.number() }).array(),
    "Problems found in the SQL, without executing it",
  ),
});

exRegistry.registerPath({
  method: "get",
  path: "/exercises/schema",
  summary: "Tables and columns of a game's database",
  description: "Feeds the editor's autocomplete and the Schema tab.",
  tags: ["Exercises"],
  request: { query: z.object({ game: z.string() }) },
  responses: createApiResponse(z.record(z.string(), z.string().array()), "Tables with their columns"),
});

exRegistry.registerPath({
  method: "get",
  path: "/exercises/definitions",
  summary: "All games and their exercises",
  description:
    "Points and penalties per exercise. The question (text, expected columns and order) only comes back from POST /game/start, which starts the timer, until the game has ended. Expected results, hints and reference solutions are never included.",
  tags: ["Exercises"],
  responses: createApiResponse(z.any().array(), "All exercises with their expected results"),
});

exRouter.post("/validate", exController.validate);
exRouter.get("/schema", exController.schema);
exRouter.get("/definitions", exController.definitions);
