import express, { type Request, type RequestHandler, type Response, type Router } from "express";
import { env } from "@/envConfig";
import { type AuthRequest, mintToken, requirePlayer } from "../auth";
import { executeQuery } from "../query";
import type { ExerciseStart, ExerciseSubmit } from "./gameModel";
import { calculatePoints } from "./scoring";

const gameModes = ["init", "running", "end"] as const;
type GameMode = (typeof gameModes)[number];
let gameMode: GameMode = "running";
const AVATAR_COUNT = 60;

export const gameRouter: Router = express.Router();

const registerUser: RequestHandler = async (_req: Request, res: Response) => {
  console.log("register user", _req.body.name);
  const name = typeof _req.body.name === "string" ? _req.body.name.trim() : "";
  if (!name) {
    return res.status(400).send({ message: "Name is required" });
  }
  if (name.length > 100) {
    return res.status(400).send({ message: "Name is too long (max 100 characters)" });
  }

  const result = await executeQuery("INSERT INTO players (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
  if (!result.rowCount) {
    return res.status(409).send({ message: `Name "${name}" is already taken, pick another one!` });
  }

  const token = await mintToken(name);
  return res.status(200).send({ message: "Registered!", name, token });
};

const startExercise: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const data: ExerciseStart = req.body;
  if (typeof data?.game !== "string" || !Number.isInteger(data.exerciseId)) {
    return res.status(400).send({ message: "game and exerciseId are required" });
  }

  await executeQuery("INSERT INTO game_start (player, game, exerciseId) VALUES ($1, $2, $3)", [
    player,
    data.game,
    data.exerciseId,
  ]);
  return res.status(200).send({ message: "Started!" });
};

async function callBackEnd(path: string, init?: RequestInit) {
  const res = await fetch(`${env.BACK_END_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "x-internal-key": env.INTERNAL_API_KEY },
    signal: AbortSignal.timeout(15000),
  });
  return res.json();
}

async function getActivity(player: string, game: string, exerciseId: number) {
  const result = await executeQuery(
    "SELECT attempts, hint, expected FROM exercise_activity WHERE player=$1 AND game=$2 AND exerciseId=$3",
    [player, game, exerciseId],
  );
  const row = result.rows[0];
  return {
    attempts: row ? Number(row.attempts) : 0,
    hint: row?.hint === true,
    expected: row?.expected === true,
  };
}

async function isSolved(player: string, game: string, exerciseId: number) {
  const result = await executeQuery("SELECT 0 FROM game_progress WHERE player=$1 AND game=$2 AND exerciseId=$3", [
    player,
    game,
    exerciseId,
  ]);
  return result.rows.length > 0;
}

const checkExercise: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const data: ExerciseSubmit = req.body;
  if (typeof data?.game !== "string" || !Number.isInteger(data.exerciseId) || typeof data.solution !== "string") {
    return res.status(400).send({ message: "game, exerciseId and solution are required" });
  }

  let body: any;
  try {
    body = await callBackEnd("/exercises/check", {
      method: "POST",
      body: JSON.stringify({ game: data.game, exerciseId: data.exerciseId, sql: data.solution }),
    });
  } catch (err) {
    console.error("Could not check solution", err);
    return res.status(503).send({ message: "Could not verify your solution, try again" });
  }

  const correct = body.success && body.responseObject.correct === true;
  await executeQuery(
    "INSERT INTO submissions (player, game, exerciseId, solution, correct, message) VALUES ($1, $2, $3, $4, $5, $6)",
    [player, data.game, data.exerciseId, data.solution, correct, body.message ?? null],
  ).catch((err) => console.error("Could not log submission", err));
  const rows = body.success ? body.responseObject.rows : null;
  const recording = gameMode === "running" && !(await isSolved(player, data.game, data.exerciseId));

  if (!correct) {
    let attempts = 0;
    if (recording) {
      const result = await executeQuery(
        `INSERT INTO exercise_activity (player, game, exerciseId, attempts) VALUES ($1, $2, $3, 1)
         ON CONFLICT (player, game, exerciseId) DO UPDATE SET attempts = exercise_activity.attempts + 1
         RETURNING attempts`,
        [player, data.game, data.exerciseId],
      );
      attempts = Number(result.rows[0].attempts);
    }
    return res.status(200).send({ correct: false, message: body.message, rows, attempts });
  }

  const cost: number | null = body.responseObject.cost;
  if (!recording) {
    const message =
      gameMode === "running"
        ? "Already solved!"
        : gameMode === "init"
          ? "Game has not yet started!"
          : "Game has finished!";
    return res.status(200).send({ correct: true, recorded: false, message, rows, cost });
  }

  const elapsedResult = await executeQuery(
    "SELECT EXTRACT(EPOCH FROM (NOW() - startTime)) AS seconds FROM game_start WHERE player=$1 AND game=$2 AND exerciseId=$3 ORDER BY startTime LIMIT 1",
    [player, data.game, data.exerciseId],
  );
  const elapsed = parseInt(elapsedResult.rows[0]?.seconds, 10) || 0;

  const { attempts, hint, expected } = await getActivity(player, data.game, data.exerciseId);
  const { points: basePoints, hintCost, expectedCost } = body.responseObject;
  const points = calculatePoints(basePoints, { hint, hintCost, expected, expectedCost }, attempts);
  const solutionLength = data.solution.replace(/\s/g, "").length;
  const values = [
    player,
    data.game,
    data.exerciseId,
    data.solution,
    solutionLength,
    elapsed,
    cost,
    points,
    hint,
    expected,
    attempts,
  ];
  await executeQuery(
    "INSERT INTO game_progress (player, game, exerciseId, solution, solutionLength, elapsed, cost, points, hint, expected, attempts) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING",
    values,
  );
  return res
    .status(200)
    .send({ correct: true, recorded: true, message: "Registered!", rows, cost, points, hint, expected, attempts });
};

const getHint: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const game = req.body?.game;
  const exerciseId = req.body?.exerciseId;
  const type = req.body?.type;
  if (typeof game !== "string" || !Number.isInteger(exerciseId) || (type !== "hint" && type !== "expected")) {
    return res.status(400).send({ message: "game, exerciseId and type (hint|expected) are required" });
  }

  let body: any;
  try {
    body = await callBackEnd(`/exercises/hint?game=${encodeURIComponent(game)}&exerciseId=${exerciseId}&type=${type}`);
  } catch (err) {
    console.error("Could not fetch hint", err);
    return res.status(503).send({ message: "Could not fetch the hint, try again" });
  }
  if (!body.success) {
    return res.status(404).send({ message: body.message });
  }

  if (gameMode === "running" && !(await isSolved(player, game, exerciseId))) {
    await executeQuery(
      `INSERT INTO exercise_activity (player, game, exerciseId, ${type}) VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (player, game, exerciseId) DO UPDATE SET ${type} = TRUE`,
      [player, game, exerciseId],
    );
  }
  return res.status(200).send(body.responseObject);
};

const getMyActivity: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const result = await executeQuery(
    "SELECT game, exerciseId, attempts, hint, expected FROM exercise_activity WHERE player=$1",
    [player],
  );
  return res.status(200).send({ player, activity: result.rows });
};

const getProgress: RequestHandler = async (_req: Request, res: Response) => {
  if (gameMode === "init") {
    return res.status(200).send({ message: "Game has not yet started!" });
  }

  if (gameMode === "end") {
    const data = await executeQuery(
      "SELECT player, game, exerciseId, solution, solutionLength, elapsed, cost, points, hint, expected, attempts FROM game_progress",
    );
    return res.status(200).send(data.rows);
  }

  const data = await executeQuery(
    "SELECT player, game, exerciseId, solutionLength, elapsed, cost, points, hint, expected, attempts FROM game_progress",
  );
  return res.status(200).send(data.rows);
};

const getState: RequestHandler = async (_req: Request, res: Response) => {
  return res.status(200).send({ mode: gameMode });
};

const getPlayers: RequestHandler = async (_req: Request, res: Response) => {
  const data = await executeQuery("SELECT id, name, avatar FROM players ORDER BY id");
  return res.status(200).send(data.rows);
};

const setAvatar: RequestHandler = async (req: Request, res: Response) => {
  if (gameMode !== "init") {
    return res.status(400).send({ message: "Avatars can only be changed before the game starts" });
  }

  const name = (req as AuthRequest).player;
  const avatar = req.body?.avatar;
  if (!Number.isInteger(avatar) || avatar < 1 || avatar > AVATAR_COUNT) {
    return res.status(400).send({ message: `Avatar must be between 1 and ${AVATAR_COUNT}` });
  }

  const result = await executeQuery("UPDATE players SET avatar=$2 WHERE LOWER(name)=LOWER($1)", [name, avatar]);
  if (!result.rowCount) {
    return res.status(404).send({ message: "Player not found" });
  }
  return res.status(200).send({ message: "Avatar updated!", avatar });
};

const requireAdmin: RequestHandler = (req: Request, res: Response, next) => {
  if (req.header("x-api-key") !== env.API_KEY) {
    return res.status(401).send({ message: "Incorrect API key" });
  }
  next();
};

const getAdmin: RequestHandler = async (_req: Request, res: Response) => {
  return res.status(200).send({ mode: gameMode, modes: gameModes });
};

const getSubmissions: RequestHandler = async (_req: Request, res: Response) => {
  let solutions: any[] = [];
  try {
    const body = await callBackEnd("/exercises/solutions");
    solutions = body.success ? body.responseObject : [];
  } catch (err) {
    console.error("Could not fetch reference solutions", err);
  }
  const result = await executeQuery(
    "SELECT id, player, game, exerciseId, solution, correct, message, submittedAt FROM submissions ORDER BY submittedAt",
  );
  return res.status(200).send({ solutions, submissions: result.rows });
};

const setMode: RequestHandler = async (req: Request, res: Response) => {
  const newMode = req.body?.mode;
  if (!gameModes.includes(newMode)) {
    return res.status(400).send({ message: `Invalid mode, expected one of: ${gameModes.join(", ")}` });
  }

  gameMode = newMode;
  console.log("Game mode", gameMode);
  return res.status(200).send({ mode: gameMode, message: `Going into ${gameMode} game mode!` });
};

gameRouter.post("/register", registerUser);
gameRouter.post("/start", requirePlayer, startExercise);
gameRouter.post("/check", requirePlayer, checkExercise);
gameRouter.post("/hint", requirePlayer, getHint);
gameRouter.get("/me", requirePlayer, getMyActivity);
gameRouter.get("/", getProgress);
gameRouter.get("/state", getState);
gameRouter.get("/players", getPlayers);
gameRouter.post("/avatar", requirePlayer, setAvatar);
gameRouter.get("/admin", requireAdmin, getAdmin);
gameRouter.post("/admin/mode", requireAdmin, setMode);
gameRouter.get("/admin/submissions", requireAdmin, getSubmissions);
