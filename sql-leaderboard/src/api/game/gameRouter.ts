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

  const name = typeof _req.body.name === 'string' ? _req.body.name.trim() : '';
  if (!name) {
    return res.status(400).send({message: 'Name is required'});
  }
  if (name.length > 100) {
    return res.status(400).send({message: 'Name is too long (max 100 characters)'});
  }

  const result = await executeQuery('INSERT INTO players (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
  if (!result.rowCount) {
    return res.status(409).send({message: `Name "${name}" is already taken, pick another one!`});
  }

  return res.status(200).send({message: 'Registered!', name});
};

const startExercise: RequestHandler = async (_req: Request, res: Response) => {
  const data: ExerciseStart = _req.body;
  console.log('Starting', data);

  const values = [data.player, data.game, data.exerciseId];
  await executeQuery('INSERT INTO game_start (player, game, exerciseId) VALUES ($1, $2, $3)', values);
  return res.status(200).send({message: 'Registered!'});
};

const submitExercise: RequestHandler = async (_req: Request, res: Response) => {
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
  const cost = await measureCost(data.game, data.solution);
  const values = [data.player, data.game, data.exerciseId, data.solution, solutionLength, elapsed, cost];
  await executeQuery('INSERT INTO game_progress (player, game, exerciseId, solution, solutionLength, elapsed, cost) VALUES ($1, $2, $3, $4, $5, $6, $7)', values);
  return res.status(200).send({message: 'Registered!', cost});
};

async function measureCost(game: string, solution: string): Promise<number | null> {
  try {
    const res = await fetch(`${env.BACK_END_URL}/exercises/cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, sql: solution }),
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json();
    if (!body.success) {
      console.warn('Could not measure cost', body.message);
      return null;
    }
    return body.responseObject.cost;
  } catch (err) {
    console.error('Could not measure cost', err);
    return null;
  }
}

const getProgress: RequestHandler = async (_req: Request, res: Response) => {
  if (gameMode === 'init') {
    return res.status(200).send({message: 'Game has not yet started!'});
  }

  if (gameMode === 'end') {
    const data = await executeQuery('SELECT player, game, exerciseId, solution, solutionLength, elapsed, cost FROM game_progress');
    return res.status(200).send(data.rows);
  }

  const data = await executeQuery('SELECT player, game, exerciseId, solutionLength, elapsed, cost FROM game_progress');
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
