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

exRouter.post("/", exController.post);
