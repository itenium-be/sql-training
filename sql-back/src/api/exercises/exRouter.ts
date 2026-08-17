import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { exController } from "./exController";

export const exRegistry = new OpenAPIRegistry();
export const exRouter: Router = express.Router();

exRegistry.registerPath({
  method: "get",
  path: "/exercises",
  tags: ["Exercises"],
  description: "The exercise catalogue. Never includes the expected results or the hints.",
  responses: createApiResponse(
    z
      .object({
        id: z.string(),
        name: z.string(),
        sampleQuery: z.string(),
        desc: z.string(),
        schema: z.boolean().optional(),
        exercises: z
          .object({
            id: z.number(),
            desc: z.string(),
            points: z.number(),
            hasHints: z.boolean(),
          })
          .array(),
      })
      .array(),
    "Success",
  ),
});

const identity = {
  player: {
    type: "string" as const,
  },
  game: {
    type: "string" as const,
  },
  exerciseId: {
    type: "number" as const,
  },
};

exRegistry.registerPath({
  method: "post",
  path: "/exercises",
  tags: ["Exercises"],
  description: "Runs the SQL and grades it. The server decides what is correct, not the browser.",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            ...identity,
            sql: {
              type: "string",
            },
          },
          required: ["player", "game", "exerciseId", "sql"],
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      rows: z.any().array(),
      truncated: z.boolean(),
      correct: z.boolean(),
      attempts: z.number(),
      cost: z.object({
        reads: z.number(),
        plannerCost: z.number(),
        rowsScanned: z.number(),
      }),
    }),
    "Success",
  ),
});

exRegistry.registerPath({
  method: "post",
  path: "/exercises/hint",
  tags: ["Exercises"],
  description: "Hands over the hint and the expected result, and records that it was asked for.",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: identity,
          required: ["player", "game", "exerciseId"],
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      hints: z.string().optional(),
      expected: z.any().array().array(),
      expectedColumns: z.string().array(),
    }),
    "Success",
  ),
});

exRouter.get("/", exController.list);
exRouter.post("/", exController.post);
exRouter.post("/hint", exController.hint);
