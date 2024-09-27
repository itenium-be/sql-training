import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { WorldSchema } from "@/api/world/worldModel";
import { worldController } from "./worldController";

export const worldRegistry = new OpenAPIRegistry();
export const worldRouter: Router = express.Router();

worldRegistry.register("World", WorldSchema);

worldRegistry.registerPath({
  method: "get",
  path: "/World/sampleData",
  tags: ["World"],
  responses: createApiResponse(z.array(WorldSchema), "Success"),
});

worldRouter.get("/sampleData", worldController.getSample);
