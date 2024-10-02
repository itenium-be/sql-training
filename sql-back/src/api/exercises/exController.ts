import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery, sqlConfig } from "../query";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import sql from 'mssql';

class ExController {
  public post: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const game = _req.body.game;
      if (game === 'Worldcup') {
        await sql.connect(sqlConfig);
        const result = await sql.query(_req.body.sql);
        const serviceResponse = ServiceResponse.success<any[]>(`SQL Server for ${game} executed`, result.recordset);
        return handleServiceResponse(serviceResponse, res);

      } else {
        const result = await executeQuery(_req.body.sql);
        const serviceResponse = ServiceResponse.success<any[]>(`Postgres SQL for ${game} executed`, result.rows);
        return handleServiceResponse(serviceResponse, res);
      }
    } catch (err: any) {
      const errorResponse = ServiceResponse.failure(err.message, err, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  };
}

export const exController = new ExController();
