import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { RequestHandler, type Router, Request, Response } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { WorldcupSampleSchema } from "./worldcupModel";

import sql from 'mssql';

const sqlConfig = {
  user: 'sa',
  password: 'password123!',
  database: 'sportdb',
  server: 'localhost',
  port: 5174,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustServerCertificate: true
  }
}

export const worldcupRegistry = new OpenAPIRegistry();
export const worldcupRouter: Router = express.Router();

worldcupRegistry.register("WorldcupSample", WorldcupSampleSchema);

worldcupRegistry.registerPath({
  method: "get",
  path: "/Worldcup/sampleData",
  tags: ["Worldcup"],
  responses: createApiResponse(z.array(WorldcupSampleSchema), "Success"),
});


const getSample: RequestHandler = async (_req: Request, res: Response) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`select * from product`
    console.dir(result.recordsets)
    const serviceResponse = ServiceResponse.success<any[]>("Footy sample found", result.recordset);
    return handleServiceResponse(serviceResponse, res);
  } catch (err) {
    console.error(err)
  }
};


worldcupRouter.get("/sampleData", getSample);
