import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { exController } from "./exController";

export const exRegistry = new OpenAPIRegistry();
export const exRouter: Router = express.Router();

exRegistry.registerPath({
  method: "post",
  path: "/exercises",
  tags: ["Exercises"],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
            },
            game: {
              type: 'string'
            }
          },
          required: ['sql', 'game'],
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
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            sql: { type: 'string' },
            game: { type: 'string' }
          },
          required: ['sql', 'game'],
        },
      },
    },
  },
  responses: createApiResponse(z.object({ message: z.string(), from: z.number(), to: z.number() }).array(), "Problems found in the SQL, without executing it"),
});

exRegistry.registerPath({
  method: "get",
  path: "/exercises/schema",
  tags: ["Exercises"],
  request: { query: z.object({ game: z.string() }) },
  responses: createApiResponse(z.record(z.string().array()), "Tables with their columns"),
});

exRegistry.registerPath({
  method: "post",
  path: "/exercises/cost",
  tags: ["Exercises"],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            sql: { type: 'string' },
            game: { type: 'string' }
          },
          required: ['sql', 'game'],
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
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            sql: { type: 'string' },
            game: { type: 'string' },
            exerciseId: { type: 'number' }
          },
          required: ['sql', 'game', 'exerciseId'],
        },
      },
    },
  },
  responses: createApiResponse(z.object({ correct: z.boolean(), cost: z.number().nullable(), rows: z.any().array() }), "Executes the query and checks it against the expected result"),
});

exRouter.post("/", exController.post);
exRouter.post("/validate", exController.validate);
exRouter.get("/schema", exController.schema);
exRouter.post("/cost", exController.cost);
exRouter.get("/definitions", exController.definitions);
exRouter.post("/check", exController.check);
