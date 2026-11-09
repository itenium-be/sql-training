import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type RequestHandler, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { env } from "@/common/utils/envConfig";
import { exController } from "./exController";

const requireInternal: RequestHandler = (req, res, next) => {
  if (req.header("x-internal-key") !== env.INTERNAL_API_KEY) {
    res.status(403).send({ success: false, message: "Internal endpoint", responseObject: null, statusCode: 403 });
    return;
  }
  next();
};

export const exRegistry = new OpenAPIRegistry();
export const exRouter: Router = express.Router();

exRegistry.registerPath({
  method: "post",
  path: "/exercises",
  tags: ["Exercises"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
            },
            game: {
              type: "string",
            },
          },
          required: ["sql", "game"],
        },
      },
    },
  },
  responses: createApiResponse(z.any().array(), "Success"),
});

exRegistry.registerPath({
  method: "post",
  path: "/exercises/validate",
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
  tags: ["Exercises"],
  request: { query: z.object({ game: z.string() }) },
  responses: createApiResponse(z.record(z.string(), z.string().array()), "Tables with their columns"),
});

exRegistry.registerPath({
  method: "post",
  path: "/exercises/cost",
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
  responses: createApiResponse(z.object({ cost: z.number() }), "Logical page reads of the query"),
});

exRegistry.registerPath({
  method: "get",
  path: "/exercises/definitions",
  tags: ["Exercises"],
  responses: createApiResponse(z.any().array(), "All exercises with their expected results"),
});

exRegistry.registerPath({
  method: "post",
  path: "/exercises/check",
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
            exerciseId: { type: "number" },
          },
          required: ["sql", "game", "exerciseId"],
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      correct: z.boolean(),
      points: z.number(),
      hintCost: z.number(),
      expectedCost: z.number(),
      cost: z.number().nullable(),
      rows: z.any().array(),
    }),
    "Internal: executes the query and checks it against the expected result",
  ),
});

exRegistry.registerPath({
  method: "get",
  path: "/exercises/hint",
  tags: ["Exercises"],
  request: { query: z.object({ game: z.string(), exerciseId: z.number(), type: z.enum(["hint", "expected"]) }) },
  responses: createApiResponse(
    z.object({
      hints: z.string().optional(),
      expected: z.any().array().optional(),
      expectedColumns: z.string().array().optional(),
    }),
    "Internal: the hint or the expected result",
  ),
});

exRegistry.registerPath({
  method: "get",
  path: "/exercises/solutions",
  tags: ["Exercises"],
  responses: createApiResponse(
    z
      .object({ game: z.string(), exerciseId: z.number(), desc: z.string(), points: z.number(), solution: z.string() })
      .array(),
    "Internal: the reference solution of every exercise",
  ),
});

exRouter.post("/", exController.post);
exRouter.post("/validate", exController.validate);
exRouter.get("/schema", exController.schema);
exRouter.post("/cost", requireInternal, exController.cost);
exRouter.get("/definitions", exController.definitions);
exRouter.post("/check", requireInternal, exController.check);
exRouter.get("/hint", requireInternal, exController.hint);
exRouter.get("/solutions", requireInternal, exController.solutions);
