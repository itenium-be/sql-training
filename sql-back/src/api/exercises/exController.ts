import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery } from "../query";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

class ExController {
  public post: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const result = await executeQuery(_req.body.sql);
      const serviceResponse = ServiceResponse.success<any[]>("SQL executed", result.rows);
      return handleServiceResponse(serviceResponse, res);
    } catch (err: any) {
      const errorResponse = ServiceResponse.failure(err.message, err, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  };
}

export const exController = new ExController();
