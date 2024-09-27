import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ExerciseSchema } from "./exModel";
import { exController } from "./exController";

export const exRegistry = new OpenAPIRegistry();
export const exRouter: Router = express.Router();

exRegistry.register("Exercise", ExerciseSchema);

exRegistry.registerPath({
  method: "get",
  path: "/exercises",
  tags: ["Exercises"],
  responses: createApiResponse(z.array(ExerciseSchema), "Success"),
});

exRouter.get("/", exController.get);
