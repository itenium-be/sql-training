import type { Request, RequestHandler, Response } from "express";

import { exService } from "@/api/exercises/exService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class ExController {
  public get: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await exService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };
}

export const exController = new ExController();
