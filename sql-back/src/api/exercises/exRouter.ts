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

exRouter.post("/", exController.post);
exRouter.post("/validate", exController.validate);
exRouter.get("/schema", exController.schema);
