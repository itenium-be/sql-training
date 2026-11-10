import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import sql from "mssql";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { gameQuery } from "../game/gameDb";
import { executeQuery, sqlConfig } from "../query";
import { isUp } from "./isUp";

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

healthCheckRegistry.registerPath({
  method: "get",
  path: "/health-check",
  summary: "Health of the back-end and its databases",
  description:
    "Always 200 while the API is up; `game` (scores), `postgres` and `mssql` (exercises) report whether each database answers `SELECT 1`.",
  tags: ["Health Check"],
  responses: createApiResponse(z.object({ game: z.boolean(), postgres: z.boolean(), mssql: z.boolean() }), "Success"),
});

healthCheckRouter.get("/", async (_req: Request, res: Response) => {
  const [game, postgres, mssql] = await Promise.all([
    isUp(() => gameQuery("SELECT 1")),
    isUp(() => executeQuery("SELECT 1")),
    isUp(async () => (await sql.connect(sqlConfig)).request().query("SELECT 1")),
  ]);
  const serviceResponse = ServiceResponse.success("Service is healthy", { game, postgres, mssql });
  return handleServiceResponse(serviceResponse, res);
});
