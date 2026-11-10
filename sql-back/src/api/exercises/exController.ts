import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import {
  findExercise,
  isCorrect,
  measureCost,
  penalties,
  QueryError,
  resolveExpected,
  runQuery,
  toObjects,
} from "./checker";
import { CostError, measurePostgres, measureSqlServer } from "./cost";
import { exercises } from "./definitions/exercises";
import { checkSql, getSchema } from "./sqlCheck";

type CheckResult = {
  correct: boolean;
  points: number;
  hintCost: number;
  expectedCost: number;
  cost: number | null;
  rows: Record<string, unknown>[];
};

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

  public solutions: RequestHandler = async (_req: Request, res: Response) => {
    const solutions = exercises.flatMap((game) =>
      game.exercises.map((ex) => ({
        game: game.id,
        exerciseId: ex.id,
        desc: ex.desc,
        points: ex.points,
        solution: ex.solution,
      })),
    );
    return handleServiceResponse(ServiceResponse.success("Solutions", solutions), res);
  };

  public hint: RequestHandler = async (_req: Request, res: Response) => {
    const exercise = findExercise(String(_req.query.game ?? ""), Number(_req.query.exerciseId));
    if (!exercise) {
      return handleServiceResponse(ServiceResponse.failure("Unknown exercise", null, StatusCodes.NOT_FOUND), res);
    }
    if (_req.query.type === "expected") {
      try {
        const expected = await resolveExpected(String(_req.query.game), exercise);
        return handleServiceResponse(
          ServiceResponse.success("Expected result", { expected, expectedColumns: exercise.expectedColumns }),
          res,
        );
      } catch (err: any) {
        return handleServiceResponse(
          ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR),
          res,
        );
      }
    }
    if (!exercise.hints) {
      return handleServiceResponse(
        ServiceResponse.failure("This exercise has no hint", null, StatusCodes.NOT_FOUND),
        res,
      );
    }
    return handleServiceResponse(ServiceResponse.success("Hint", { hints: exercise.hints }), res);
  };

  public check: RequestHandler = async (_req: Request, res: Response) => {
    const { game, exerciseId, sql: query } = _req.body ?? {};
    if (typeof query !== "string" || typeof game !== "string") {
      return handleServiceResponse(
        ServiceResponse.failure("sql, game and exerciseId are required", null, StatusCodes.BAD_REQUEST),
        res,
      );
    }
    const exercise = findExercise(game, Number(exerciseId));
    if (!exercise) {
      return handleServiceResponse(
        ServiceResponse.failure(`Unknown exercise ${game}-${exerciseId}`, null, StatusCodes.NOT_FOUND),
        res,
      );
    }
    try {
      const result = await runQuery(game, query);
      const correct = isCorrect(exercise, await resolveExpected(game, exercise), result);
      const rows = toObjects(result);
      const cost = correct ? await measureCost(game, query) : null;
      return handleServiceResponse(
        ServiceResponse.success<CheckResult>(correct ? "Correct" : "Query result does not match expected output!", {
          correct,
          cost,
          rows,
          points: exercise.points,
          ...penalties(exercise),
        }),
        res,
      );
    } catch (err: any) {
      const status = err instanceof QueryError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
      return handleServiceResponse(ServiceResponse.failure(err.message, null, status), res);
    }
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

  public cost: RequestHandler = async (_req: Request, res: Response) => {
    const { game, sql: query } = _req.body ?? {};
    if (typeof query !== "string" || typeof game !== "string") {
      const errorResponse = ServiceResponse.failure("sql and game are required", null, StatusCodes.BAD_REQUEST);
      return handleServiceResponse(errorResponse, res);
    }
    if (/statement_timeout/i.test(query)) {
      const errorResponse = ServiceResponse.failure(
        "Changing statement_timeout is not allowed",
        null,
        StatusCodes.BAD_REQUEST,
      );
      return handleServiceResponse(errorResponse, res);
    }
    try {
      const cost = game === "Worldcup" ? await measureSqlServer(query) : await measurePostgres(query);
      const serviceResponse = ServiceResponse.success<{ cost: number }>(`Cost for ${game} measured`, { cost });
      return handleServiceResponse(serviceResponse, res);
    } catch (err: any) {
      const status = err instanceof CostError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
      const errorResponse = ServiceResponse.failure(err.message, null, status);
      return handleServiceResponse(errorResponse, res);
    }
  };
}

export const exController = new ExController();
