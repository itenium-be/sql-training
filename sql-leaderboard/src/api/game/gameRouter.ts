import express, { Request, Router, RequestHandler, Response } from "express";
import { executeQuery } from "../query";
import { ExerciseStart, ExerciseSubmit } from "./gameModel";
import { env } from "@/envConfig";

const gameModes = ['init', 'running', 'end'] as const;
type GameMode = typeof gameModes[number];
let gameMode: GameMode = 'running';
const AVATAR_COUNT = 60;

export const gameRouter: Router = express.Router();

const registerUser: RequestHandler = async (_req: Request, res: Response) => {
  console.log('register user', _req.body.name);
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
  const values = [data.player, data.game, data.exerciseId, data.solution, solutionLength, elapsed];
  await executeQuery('INSERT INTO game_progress (player, game, exerciseId, solution, solutionLength, elapsed) VALUES ($1, $2, $3, $4, $5, $6)', values);
  return res.status(200).send({message: 'Registered!'});
};

const getProgress: RequestHandler = async (_req: Request, res: Response) => {
  if (gameMode === 'init') {
    return res.status(200).send({message: 'Game has not yet started!'});
  }

  if (gameMode === 'end') {
    const data = await executeQuery('SELECT player, game, exerciseId, solution, solutionLength, elapsed FROM game_progress');
    return res.status(200).send(data.rows);
  }

  const data = await executeQuery('SELECT player, game, exerciseId, solutionLength, elapsed FROM game_progress');
  return res.status(200).send(data.rows);
};

const getState: RequestHandler = async (_req: Request, res: Response) => {
  return res.status(200).send({mode: gameMode});
};

const getPlayers: RequestHandler = async (_req: Request, res: Response) => {
  const data = await executeQuery('SELECT id, name, avatar FROM players ORDER BY id');
  return res.status(200).send(data.rows);
};

const setAvatar: RequestHandler = async (req: Request, res: Response) => {
  if (gameMode !== 'init') {
    return res.status(400).send({message: 'Avatars can only be changed before the game starts'});
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const avatar = req.body?.avatar;
  if (!Number.isInteger(avatar) || avatar < 1 || avatar > AVATAR_COUNT) {
    return res.status(400).send({message: `Avatar must be between 1 and ${AVATAR_COUNT}`});
  }

  const result = await executeQuery('UPDATE players SET avatar=$2 WHERE LOWER(name)=LOWER($1)', [name, avatar]);
  if (!result.rowCount) {
    return res.status(404).send({message: 'Player not found'});
  }
  return res.status(200).send({message: 'Avatar updated!', avatar});
};

const requireAdmin: RequestHandler = (req: Request, res: Response, next) => {
  if (req.header('x-api-key') !== env.API_KEY) {
    return res.status(401).send({message: 'Incorrect API key'});
  }
  next();
};

const getAdmin: RequestHandler = async (_req: Request, res: Response) => {
  return res.status(200).send({mode: gameMode, modes: gameModes});
};

const setMode: RequestHandler = async (req: Request, res: Response) => {
  const newMode = req.body?.mode;
  if (!gameModes.includes(newMode)) {
    return res.status(400).send({message: `Invalid mode, expected one of: ${gameModes.join(', ')}`});
  }

  gameMode = newMode;
  console.log('Game mode', gameMode);
  return res.status(200).send({mode: gameMode, message: `Going into ${gameMode} game mode!`});
};

gameRouter.post("/register", registerUser);
gameRouter.post("/start", startExercise);
gameRouter.post("/", submitExercise);
gameRouter.get("/", getProgress);
gameRouter.get("/state", getState);
gameRouter.get("/players", getPlayers);
gameRouter.post("/avatar", setAvatar);
gameRouter.get("/admin", requireAdmin, getAdmin);
gameRouter.post("/admin/mode", requireAdmin, setMode);
