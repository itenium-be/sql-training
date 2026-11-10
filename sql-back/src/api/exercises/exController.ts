import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { penalties } from "./checker";
import { exercises } from "./definitions/exercises";
import { checkSql, getSchema } from "./sqlCheck";

class ExController {
  public definitions: RequestHandler = async (_req: Request, res: Response) => {
    const publicExercises = exercises.map((game) => ({
      ...game,
      exercises: game.exercises.map(({ expected, hints, hintCost, expectedCost, solution, ...exercise }) => ({
        ...exercise,
        hasHint: !!hints,
        ...penalties({ ...exercise, expected, hints, hintCost, expectedCost, solution }),
      })),
    }));
    return handleServiceResponse(ServiceResponse.success("Exercises", publicExercises), res);
  };

  public validate: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const text: string = _req.body.sql ?? "";
      if (/statement_timeout/i.test(text)) {
        const index = text.search(/statement_timeout/i);
        return handleServiceResponse(
          ServiceResponse.success("Checked", [
            {
              message: "Changing statement_timeout is not allowed",
              from: index,
              to: index + "statement_timeout".length,
            },
          ]),
          res,
        );
      }
      const problems = await checkSql(_req.body.game, text);
      return handleServiceResponse(ServiceResponse.success("Checked", problems), res);
    } catch (err: any) {
      return handleServiceResponse(ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR), res);
    }
  };

  public schema: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const schema = await getSchema(String(_req.query.game ?? ""));
      return handleServiceResponse(ServiceResponse.success("Schema", schema), res);
    } catch (err: any) {
      return handleServiceResponse(ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR), res);
    }
  };
}

export const exController = new ExController();
