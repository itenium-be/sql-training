import type { Request, RequestHandler, Response } from "express";
import { Client, ClientConfig } from 'pg'
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { env } from "@/common/utils/envConfig";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { World } from "./worldModel";

class WorldController {
  public getSample: RequestHandler = async (_req: Request, res: Response) => {
    const options: ClientConfig = {
      user: env.PG_USER,
      database: 'world',
      password: env.PG_PASSWORD,
      port: env.PG_PORT,
      host: env.PG_HOST,
    };
    const client = new Client(options);
    await client.connect();
    const result = await client.query('SELECT * FROM countries LIMIT 5');
    const serviceResponse = ServiceResponse.success<World[]>("Countries found", result.rows);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const worldController = new WorldController();
