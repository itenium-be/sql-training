import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executePlayerQueryPostgres, executePlayerQuerySqlServer, type PlayerQueryResult } from "../query";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { env } from "@/common/utils/envConfig";

class ExController {
  public post: RequestHandler = async (_req: Request, res: Response) => {
    const game = _req.body.game;
    const text: unknown = _req.body.sql;

    if (typeof text !== "string" || !text.trim()) {
      const errorResponse = ServiceResponse.failure("No SQL to run", null, StatusCodes.BAD_REQUEST);
      return handleServiceResponse(errorResponse, res);
    }

    if (text.length > env.QUERY_MAX_LENGTH) {
      const message = `That is ${text.length} characters of SQL, the limit is ${env.QUERY_MAX_LENGTH} 😅`;
      const errorResponse = ServiceResponse.failure(message, null, StatusCodes.BAD_REQUEST);
      return handleServiceResponse(errorResponse, res);
    }

    try {
      const isSqlServer = game === "Worldcup";
      const result: PlayerQueryResult = isSqlServer
        ? await executePlayerQuerySqlServer(text)
        : await executePlayerQueryPostgres(text);

      const engine = isSqlServer ? "SQL Server" : "Postgres";
      const serviceResponse = ServiceResponse.success(`${engine} for ${game} executed`, result);
      return handleServiceResponse(serviceResponse, res);
    } catch (err: any) {
      const errorResponse = ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  };
}

export const exController = new ExController();
