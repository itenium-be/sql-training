import express, { Request, Router, RequestHandler, Response } from "express";
import { executeQuery } from "../query";
import { ExerciseStart, ExerciseSubmit } from "./gameModel";
import { env } from "@/envConfig";

type GameMode = 'init' | 'running' | 'end';
let gameMode: GameMode = 'running';

export const gameRouter: Router = express.Router();

const registerUser: RequestHandler = async (_req: Request, res: Response) => {
  console.log('register user', _req.body.name);
  if (gameMode === 'init') {
    return res.status(400).send({message: 'Game has yet to start!'})
  }

  return res.status(200).send({message: 'Registered!'});
};

const startExercise: RequestHandler = async (_req: Request, res: Response) => {
  const data: ExerciseStart = _req.body;
  console.log('Starting', data);

  const values = [data.player, data.game, data.exerciseId];
  await executeQuery('INSERT INTO game_start (player, game, exerciseId) VALUES ($1, $2, $3)', values);
  return res.status(200).send({message: 'Registered!'});
};

const submitExercise: RequestHandler = async (_req: Request, res: Response) => {
  // Scores arrive from sql-back, which graded the query and counted the
  // attempts itself. A player curling this endpoint has no business here.
  if (_req.header('x-internal-key') !== env.INTERNAL_API_KEY) {
    return res.status(401).send({message: 'Scores are submitted by the query server, not by players'});
  }

  if (gameMode === 'init') {
    return res.status(200).send({message: 'Game has not yet started!'});
  }
  if (gameMode === 'end') {
    return res.status(200).send({message: 'Game has finished!'});
  }

  const data: ExerciseSubmit = _req.body;
  console.log('Submit', data);

  const checkValues = [data.player, data.game, data.exerciseId];
  const checkExists = await executeQuery('SELECT 0 FROM game_progress WHERE player=$1 AND game=$2 AND exerciseId=$3', checkValues);
  if (checkExists.rows.length) {
    return res.status(400).send({message: 'Already submitted!?'});
  }

  const elapsedResult = await executeQuery('SELECT EXTRACT(EPOCH FROM (NOW() - startTime)) AS seconds FROM game_start WHERE player=$1 AND game=$2 AND exerciseId=$3 LIMIT 1', checkValues);
  let elapsed = 0;
  if (elapsedResult && elapsedResult.rows && elapsedResult.rows.length) {
    elapsed = parseInt(elapsedResult.rows[0].seconds) || 0;
  }

  const solutionLength = data.solution.replace(/\s/g, '').length;
  const values = [
    data.player,
    data.game,
    data.exerciseId,
    data.solution,
    solutionLength,
    elapsed,
    positiveNumber(data.attempts, 1),
    positiveNumber(data.hintsUsed, 0),
    positiveNumber(data.reads, 0),
    positiveNumber(data.plannerCost, 0),
    positiveNumber(data.rowsScanned, 0),
  ];
  await executeQuery(
    `INSERT INTO game_progress
      (player, game, exerciseId, solution, solutionLength, elapsed, attempts, hintsUsed, reads, plannerCost, rowsScanned)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    values
  );
  return res.status(200).send({message: 'Registered!'});
};

/** Everything the client reports about its own run has to survive being nonsense. */
function positiveNumber(value: unknown, fallback: number): number {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

const getProgress: RequestHandler = async (_req: Request, res: Response) => {
  if (gameMode === 'init') {
    return res.status(200).send({message: 'Game has not yet started!'});
  }

  const metrics = 'solutionLength, elapsed, attempts, hintsUsed, reads, plannerCost, rowsScanned';

  if (gameMode === 'end') {
    const data = await executeQuery(`SELECT player, game, exerciseId, solution, ${metrics} FROM game_progress`);
    return res.status(200).send(data.rows);
  }

  const data = await executeQuery(`SELECT player, game, exerciseId, ${metrics} FROM game_progress`);
  return res.status(200).send(data.rows);
};

const setMode: RequestHandler = async (_req: Request, res: Response) => {
  const apiKey = _req.query.apiKey;
  if (apiKey !== env.API_KEY) {
    return res.status(401).send({message: 'Incorrect apiKey (?apiKey=secret&mode=init|running|end'});
  }

  const newMode = _req.query.mode as GameMode;
  gameMode = newMode;
  return res.status(200).send({message: `Going into ${gameMode} game mode!`});
};

gameRouter.post("/register", registerUser);
gameRouter.post("/start", startExercise);
gameRouter.post("/", submitExercise);
gameRouter.get("/", getProgress);
gameRouter.get("/mode", setMode);
