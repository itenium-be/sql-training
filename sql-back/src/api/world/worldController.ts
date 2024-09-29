import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { World } from "./worldModel";
import { executeQuery } from "../query";

class WorldController {
  public getSample: RequestHandler = async (_req: Request, res: Response) => {
    const result = await executeQuery('SELECT * FROM countries LIMIT 5');
    const serviceResponse = ServiceResponse.success<World[]>("Countries found", result.rows);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const worldController = new WorldController();
