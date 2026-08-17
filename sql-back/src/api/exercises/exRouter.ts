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
  responses: createApiResponse(
    z.object({
      rows: z.any().array(),
      truncated: z.boolean(),
      cost: z.object({
        reads: z.number(),
        plannerCost: z.number(),
        rowsScanned: z.number(),
      }),
    }),
    "Success",
  ),
});

exRouter.post("/", exController.post);
