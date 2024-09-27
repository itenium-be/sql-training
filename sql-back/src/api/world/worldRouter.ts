import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetWorldSchema, WorldSchema } from "@/api/world/worldModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { worldController } from "./worldController";

export const worldRegistry = new OpenAPIRegistry();
export const worldRouter: Router = express.Router();

worldRegistry.register("World", WorldSchema);

worldRegistry.registerPath({
  method: "get",
  path: "/world",
  tags: ["World"],
  responses: createApiResponse(z.array(WorldSchema), "Success"),
});

worldRouter.get("/", worldController.getWorld);
