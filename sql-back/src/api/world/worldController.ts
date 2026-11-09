import type { Request, RequestHandler, Response } from "express";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery } from "../query";
import type { World } from "./worldModel";

class WorldController {
  public getSample: RequestHandler = async (_req: Request, res: Response) => {
    const result = await executeQuery("SELECT * FROM countries LIMIT 5");
    const serviceResponse = ServiceResponse.success<World[]>("Countries found", result.rows);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const worldController = new WorldController();
