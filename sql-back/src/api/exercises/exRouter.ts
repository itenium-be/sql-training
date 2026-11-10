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
  method: "get",
  path: "/exercises/definitions",
  tags: ["Exercises"],
  responses: createApiResponse(z.any().array(), "All exercises with their expected results"),
});

exRouter.post("/", exController.post);
exRouter.post("/validate", exController.validate);
exRouter.get("/schema", exController.schema);
exRouter.post("/cost", requireInternal, exController.cost);
exRouter.get("/definitions", exController.definitions);
exRouter.post("/check", requireInternal, exController.check);
exRouter.get("/hint", requireInternal, exController.hint);
exRouter.get("/solutions", requireInternal, exController.solutions);
