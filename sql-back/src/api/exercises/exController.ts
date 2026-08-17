import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executePlayerQueryPostgres, executePlayerQuerySqlServer, type PlayerQueryResult } from "../query";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { env } from "@/common/utils/envConfig";
import { exercises, findExercise } from "./definitions";
import {
  type ExerciseHint,
  type PublicExercise,
  type SqlExerciseModel,
  toPublicExercise,
} from "./exerciseModels";
import { isCorrect } from "./grading";
import { getProgress, recordAttempt, recordHint } from "./playerProgress";
import { submitScore } from "./leaderboardClient";

type ExerciseRequest = {
  player?: unknown;
  game?: unknown;
  exerciseId?: unknown;
};

type ParsedRequest =
  | { error: string }
  | { error?: undefined; player: string; game: string; exerciseId: number; exercise: SqlExerciseModel };

/** Pulls the bits every exercise endpoint needs, or explains what is missing. */
function readRequest(body: ExerciseRequest): ParsedRequest {
  const player = typeof body.player === "string" ? body.player.trim() : "";
  const game = typeof body.game === "string" ? body.game : "";
  const exerciseId = Number(body.exerciseId);

  if (!player) {
    return { error: "Who are you? Register first." };
  }
  if (!Number.isInteger(exerciseId)) {
    return { error: "No exercise to check against" };
  }

  const exercise = findExercise(game, exerciseId);
  if (!exercise) {
    return { error: `No exercise ${game}-${exerciseId}` };
  }

  return { player, game, exerciseId, exercise };
}

class ExController {
  /** The catalogue, minus every answer. This is all the browser ever gets. */
  public list: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = ServiceResponse.success<PublicExercise[]>(
      "Exercises found",
      exercises.map(toPublicExercise),
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public post: RequestHandler = async (_req: Request, res: Response) => {
    const parsed = readRequest(_req.body);
    if (parsed.error !== undefined) {
      return handleServiceResponse(ServiceResponse.failure(parsed.error, null, StatusCodes.BAD_REQUEST), res);
    }
    const { player, game, exerciseId, exercise } = parsed;

    const text: unknown = _req.body.sql;
    if (typeof text !== "string" || !text.trim()) {
      return handleServiceResponse(ServiceResponse.failure("No SQL to run", null, StatusCodes.BAD_REQUEST), res);
    }
    if (text.length > env.QUERY_MAX_LENGTH) {
      const message = `That is ${text.length} characters of SQL, the limit is ${env.QUERY_MAX_LENGTH} 😅`;
      return handleServiceResponse(ServiceResponse.failure(message, null, StatusCodes.BAD_REQUEST), res);
    }

    const attempts = recordAttempt(player, game, exerciseId);

    let result: PlayerQueryResult;
    try {
      result =
        game === "Worldcup" ? await executePlayerQuerySqlServer(text) : await executePlayerQueryPostgres(text);
    } catch (err: any) {
      // A broken query is still an attempt, which is the point of counting them.
      return handleServiceResponse(
        ServiceResponse.failure(err.message, null, StatusCodes.INTERNAL_SERVER_ERROR),
        res,
      );
    }

    const correct = isCorrect(exercise, result.rows);
    const body = {
      rows: result.rows.slice(0, env.QUERY_MAX_ROWS),
      truncated: result.truncated,
      cost: result.cost,
      correct,
      attempts,
    };

    if (!correct) {
      return handleServiceResponse(
        ServiceResponse.success("Query result does not match expected output!", body),
        res,
      );
    }

    try {
      await submitScore({
        player,
        game,
        exerciseId,
        solution: text,
        attempts,
        hintsUsed: getProgress(player, game, exerciseId).hintsUsed,
        reads: result.cost.reads,
        plannerCost: result.cost.plannerCost,
        rowsScanned: result.cost.rowsScanned,
      });
    } catch (err: any) {
      console.error("could not submit score", err.message);
      return handleServiceResponse(
        ServiceResponse.success("Correct! But your score could not be saved 😭", body),
        res,
      );
    }

    return handleServiceResponse(ServiceResponse.success("Correct!", body), res);
  };

  /**
   * Hints are a request rather than something shipped to the browser up front,
   * so asking for one can actually cost the no-hints bonus.
   */
  public hint: RequestHandler = async (_req: Request, res: Response) => {
    const parsed = readRequest(_req.body);
    if (parsed.error !== undefined) {
      return handleServiceResponse(ServiceResponse.failure(parsed.error, null, StatusCodes.BAD_REQUEST), res);
    }
    const { player, game, exerciseId, exercise } = parsed;

    recordHint(player, game, exerciseId);

    const hint: ExerciseHint = {
      hints: exercise.hints,
      expected: exercise.expected,
      expectedColumns: exercise.expectedColumns,
    };
    return handleServiceResponse(ServiceResponse.success("Here you go", hint), res);
  };
}

export const exController = new ExController();
