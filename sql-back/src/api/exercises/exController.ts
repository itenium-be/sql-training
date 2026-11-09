import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { checkSql, getSchema } from "./sqlCheck";
import { CostError, measurePostgres, measureSqlServer } from "./cost";
import { QueryError, findExercise, isCorrect, measureCost, runQuery, toObjects } from "./checker";
import { exercises } from "./definitions/exercises";

type CheckResult = {
  correct: boolean;
  points: number;
  cost: number | null;
  rows: Record<string, unknown>[];
};

class ExController {
  public post: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const game = _req.body.game;
      const rows = toObjects(await runQuery(game, _req.body.sql ?? ''));
      const serviceResponse = ServiceResponse.success<any[]>(`${game === 'Worldcup' ? 'SQL Server' : 'Postgres SQL'} for ${game} executed`, rows);
      return handleServiceResponse(serviceResponse, res);
    } catch (err: any) {
      const status = err instanceof QueryError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
      const errorResponse = ServiceResponse.failure(err.message, null, status);
      return handleServiceResponse(errorResponse, res);
    }
  };

  public definitions: RequestHandler = async (_req: Request, res: Response) => {
    const publicExercises = exercises.map(game => ({
      ...game,
      exercises: game.exercises.map(({ expected, hints, ...exercise }) => exercise),
    }));
    return handleServiceResponse(ServiceResponse.success('Exercises', publicExercises), res);
  };

  public hint: RequestHandler = async (_req: Request, res: Response) => {
    const exercise = findExercise(String(_req.query.game ?? ''), Number(_req.query.exerciseId));
    if (!exercise) {
      return handleServiceResponse(ServiceResponse.failure('Unknown exercise', null, StatusCodes.NOT_FOUND), res);
    }
    const { hints, expected, expectedColumns } = exercise;
    return handleServiceResponse(ServiceResponse.success('Hint', { hints: hints ?? null, expected, expectedColumns }), res);
  };

  public check: RequestHandler = async (_req: Request, res: Response) => {
    const { game, exerciseId, sql: query } = _req.body ?? {};
    if (typeof query !== 'string' || typeof game !== 'string') {
      return handleServiceResponse(ServiceResponse.failure('sql, game and exerciseId are required', null, StatusCodes.BAD_REQUEST), res);
    }
    const exercise = findExercise(game, Number(exerciseId));
    if (!exercise) {
      return handleServiceResponse(ServiceResponse.failure(`Unknown exercise ${game}-${exerciseId}`, null, StatusCodes.NOT_FOUND), res);
    }
    try {
      const result = await runQuery(game, query);
      const correct = isCorrect(exercise, result);
      const rows = toObjects(result);
      const cost = correct ? await measureCost(game, query) : null;
      return handleServiceResponse(ServiceResponse.success<CheckResult>(correct ? 'Correct' : 'Query result does not match expected output!', { correct, cost, rows, points: exercise.points }), res);
    } catch (err: any) {
      const status = err instanceof QueryError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
      return handleServiceResponse(ServiceResponse.failure(err.message, null, status), res);
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
