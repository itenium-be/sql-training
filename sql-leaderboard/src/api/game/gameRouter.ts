import express, { Request, Router, RequestHandler, Response } from "express";
import { executeQuery } from "../query";
import { ExerciseStart, ExerciseSubmit } from "./gameModel";
import { env } from "@/envConfig";

export const gameRouter: Router = express.Router();

const registerUser: RequestHandler = async (_req: Request, res: Response) => {
  console.log('register user', _req.body.name);
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
  const values = [data.player, data.game, data.exerciseId, data.solution, solutionLength, elapsed];
  await executeQuery('INSERT INTO game_progress (player, game, exerciseId, solution, solutionLength, elapsed) VALUES ($1, $2, $3, $4, $5, $6)', values);
  return res.status(200).send({message: 'Registered!'});
};

const getProgress: RequestHandler = async (_req: Request, res: Response) => {
  const data = await executeQuery('SELECT player, game, exerciseId, solutionLength, elapsed FROM game_progress');
  return res.status(200).send(data.rows);
};

const getFinal: RequestHandler = async (_req: Request, res: Response) => {
  const apiKey = _req.query.apiKey;
  if (apiKey !== env.API_KEY) {
    return res.status(401).send({message: 'Incorrect apiKey (?apiKey=secret)!'});
  }

  // TODO: send this as a html table?
  const data = await executeQuery('SELECT player, game, exerciseId, solution, solutionLength, elapsed FROM game_progress');
  return res.status(200).send(data.rows);
};

gameRouter.post("/register", registerUser);
gameRouter.post("/start", startExercise);
gameRouter.post("/", submitExercise);
gameRouter.get("/", getProgress);
gameRouter.get("/final", getFinal);