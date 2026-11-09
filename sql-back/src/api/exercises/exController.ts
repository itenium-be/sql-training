import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery, sqlConfig } from "../query";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import sql from 'mssql';
import { checkSql, getSchema } from "./sqlCheck";

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

  public validate: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const text: string = _req.body.sql ?? '';
      if (/statement_timeout/i.test(text)) {
        const index = text.search(/statement_timeout/i);
        return handleServiceResponse(ServiceResponse.success('Checked', [{ message: 'Changing statement_timeout is not allowed', from: index, to: index + 'statement_timeout'.length }]), res);
      }
      const problems = await checkSql(_req.body.game, text);
      return handleServiceResponse(ServiceResponse.success('Checked', problems), res);
    } catch (err: any) {
      return handleServiceResponse(ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR), res);
    }
  };

  public schema: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const schema = await getSchema(String(_req.query.game ?? ''));
      return handleServiceResponse(ServiceResponse.success('Schema', schema), res);
    } catch (err: any) {
      return handleServiceResponse(ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR), res);
    }
  };
}

export const exController = new ExController();
