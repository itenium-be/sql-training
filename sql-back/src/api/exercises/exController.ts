import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery, sqlConfig } from "../query";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import sql from 'mssql';
import { CostError, measurePostgres, measureSqlServer } from "./cost";

class ExController {
  public post: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const game = _req.body.game;
      if (/statement_timeout/i.test(_req.body.sql ?? '')) {
        const errorResponse = ServiceResponse.failure('Changing statement_timeout is not allowed', null, StatusCodes.BAD_REQUEST);
        return handleServiceResponse(errorResponse, res);
      }
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

  public cost: RequestHandler = async (_req: Request, res: Response) => {
    const { game, sql: query } = _req.body ?? {};
    if (typeof query !== 'string' || typeof game !== 'string') {
      const errorResponse = ServiceResponse.failure('sql and game are required', null, StatusCodes.BAD_REQUEST);
      return handleServiceResponse(errorResponse, res);
    }
    if (/statement_timeout/i.test(query)) {
      const errorResponse = ServiceResponse.failure('Changing statement_timeout is not allowed', null, StatusCodes.BAD_REQUEST);
      return handleServiceResponse(errorResponse, res);
    }
    try {
      const cost = game === 'Worldcup' ? await measureSqlServer(query) : await measurePostgres(query);
      const serviceResponse = ServiceResponse.success<{cost: number}>(`Cost for ${game} measured`, { cost });
      return handleServiceResponse(serviceResponse, res);
    } catch (err: any) {
      const status = err instanceof CostError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
      const errorResponse = ServiceResponse.failure(err.message, null, status);
      return handleServiceResponse(errorResponse, res);
    }
  };
}

export const exController = new ExController();
