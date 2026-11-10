import express, { type Request, type RequestHandler, type Response, type Router } from "express";
import { exercises } from "@/api/exercises/definitions/exercises";
import { checkSolution, exerciseHint, referenceSolutions } from "@/api/exercises/exerciseService";
import { exerciseDetails, publicDefinitions } from "@/api/exercises/publicDefinitions";
import { env } from "@/common/utils/envConfig";
import { shouldRecordActivity } from "./activity";
import { type AuthRequest, mintToken, requirePlayer } from "./auth";
import { gameQuery } from "./gameDb";
import { gameModes, getGameMode, parseGameMode, setGameMode, startRefusal } from "./gameMode";
import type { ExerciseStart, ExerciseSubmit } from "./gameModel";
import { calculatePoints } from "./scoring";

export async function restoreGameMode() {
  const result = await gameQuery("SELECT value FROM settings WHERE key='game_mode'");
  setGameMode(parseGameMode(result.rows[0]?.value));
}

// Sanity ceiling only; the avatar catalogue is defined in the frontend (avatars.ts).
const MAX_AVATAR = 500;

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

  const result = await gameQuery("INSERT INTO players (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
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

  const refusal = startRefusal(getGameMode());
  if (refusal) {
    return res.status(409).send({ message: refusal });
  }
  const exercise = exerciseDetails(exercises, data.game, data.exerciseId);
  if (!exercise) {
    return res.status(404).send({ message: `Unknown exercise ${data.game}-${data.exerciseId}` });
  }

  await gameQuery("INSERT INTO game_start (player, game, exerciseId) VALUES ($1, $2, $3)", [
    player,
    data.game,
    data.exerciseId,
  ]);
  const elapsed = await firstStartElapsed(player, data.game, data.exerciseId);
  return res.status(200).send({ message: "Started!", elapsed, exercise });
};

async function firstStartElapsed(player: string, game: string, exerciseId: number): Promise<number> {
  const result = await gameQuery(
    "SELECT EXTRACT(EPOCH FROM (NOW() - startTime)) AS seconds FROM game_start WHERE player=$1 AND game=$2 AND exerciseId=$3 ORDER BY startTime LIMIT 1",
    [player, game, exerciseId],
  );
  return parseInt(result.rows[0]?.seconds, 10) || 0;
}

async function hasStarted(player: string, game: string, exerciseId: number) {
  const result = await gameQuery("SELECT 0 FROM game_start WHERE player=$1 AND game=$2 AND exerciseId=$3 LIMIT 1", [
    player,
    game,
    exerciseId,
  ]);
  return result.rows.length > 0;
}

const NOT_STARTED = "Open the exercise first";

async function getActivity(player: string, game: string, exerciseId: number) {
  const result = await gameQuery(
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
  const result = await gameQuery("SELECT 0 FROM game_progress WHERE player=$1 AND game=$2 AND exerciseId=$3", [
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

  if (!(await hasStarted(player, data.game, data.exerciseId))) {
    return res.status(409).send({ message: NOT_STARTED });
  }

  const body = await checkSolution(data.game, data.exerciseId, data.solution);
  const correct = body.success && body.responseObject?.correct === true;
  await gameQuery(
    "INSERT INTO submissions (player, game, exerciseId, solution, correct, message) VALUES ($1, $2, $3, $4, $5, $6)",
    [player, data.game, data.exerciseId, data.solution, correct, body.message ?? null],
  ).catch((err) => console.error("Could not log submission", err));
  const rows = body.responseObject?.rows ?? null;
  const recording = getGameMode() === "running" && !(await isSolved(player, data.game, data.exerciseId));

  if (!correct) {
    let attempts = 0;
    if (recording) {
      const result = await gameQuery(
        `INSERT INTO exercise_activity (player, game, exerciseId, attempts) VALUES ($1, $2, $3, 1)
         ON CONFLICT (player, game, exerciseId) DO UPDATE SET attempts = exercise_activity.attempts + 1
         RETURNING attempts`,
        [player, data.game, data.exerciseId],
      );
      attempts = Number(result.rows[0].attempts);
    }
    return res.status(200).send({ correct: false, message: body.message, rows, attempts });
  }

  const result = body.responseObject!;
  const cost = result.cost;
  if (!recording) {
    const message =
      getGameMode() === "running"
        ? "Already solved!"
        : getGameMode() === "init"
          ? "Game has not yet started!"
          : "Game has finished!";
    return res.status(200).send({ correct: true, recorded: false, message, rows, cost });
  }

  const elapsed = await firstStartElapsed(player, data.game, data.exerciseId);

  const { attempts, hint, expected } = await getActivity(player, data.game, data.exerciseId);
  const { points: basePoints, hintCost, expectedCost } = result;
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
  await gameQuery(
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

  if (!(await hasStarted(player, game, exerciseId))) {
    return res.status(409).send({ message: NOT_STARTED });
  }

  const body = await exerciseHint(game, exerciseId, type);
  if (!body.success) {
    return res.status(body.statusCode).send({ message: body.message });
  }

  if (getGameMode() === "running" && !(await isSolved(player, game, exerciseId))) {
    await gameQuery(
      `INSERT INTO exercise_activity (player, game, exerciseId, ${type}) VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (player, game, exerciseId) DO UPDATE SET ${type} = TRUE`,
      [player, game, exerciseId],
    );
  }
  return res.status(200).send(body.responseObject);
};

const getMyActivity: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const [activity, started] = await Promise.all([
    gameQuery("SELECT game, exerciseId, attempts, hint, expected FROM exercise_activity WHERE player=$1", [player]),
    gameQuery("SELECT DISTINCT game, exerciseId FROM game_start WHERE player=$1", [player]),
  ]);
  const opened = started.rows.map((row) => {
    const exerciseId = Number(row.exerciseid);
    return { game: row.game, exerciseId, ...exerciseDetails(exercises, row.game, exerciseId) };
  });
  return res.status(200).send({ player, activity: activity.rows, exercises: opened });
};

const recordActivity: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const game = req.body?.game;
  const exerciseId = req.body?.exerciseId;
  if (typeof game !== "string" || !Number.isInteger(exerciseId)) {
    return res.status(400).send({ message: "game and exerciseId are required" });
  }

  if (shouldRecordActivity(getGameMode(), await isSolved(player, game, exerciseId))) {
    await gameQuery(
      `INSERT INTO exercise_activity (player, game, exerciseId, lastActiveAt) VALUES ($1, $2, $3, NOW())
       ON CONFLICT (player, game, exerciseId) DO UPDATE SET lastActiveAt = NOW()`,
      [player, game, exerciseId],
    );
  }
  return res.status(200).send({ ok: true });
};

const getMySolution: RequestHandler = async (req: Request, res: Response) => {
  const player = (req as AuthRequest).player;
  const game = req.query.game;
  const exerciseId = Number(req.query.exerciseId);
  if (typeof game !== "string" || !Number.isInteger(exerciseId)) {
    return res.status(400).send({ message: "game and exerciseId are required" });
  }

  const result = await gameQuery(
    "SELECT solution, elapsed FROM game_progress WHERE player=$1 AND game=$2 AND exerciseId=$3",
    [player, game, exerciseId],
  );
  const row = result.rows[0];
  if (!row) {
    return res.status(404).send({ message: "Not solved yet" });
  }

  const rows = (await checkSolution(game, exerciseId, row.solution)).responseObject?.rows ?? null;
  return res.status(200).send({ solution: row.solution, elapsed: Number(row.elapsed), rows });
};

const getProgress: RequestHandler = async (_req: Request, res: Response) => {
  if (getGameMode() === "init") {
    return res.status(200).send({ message: "Game has not yet started!" });
  }

  if (getGameMode() === "end") {
    const data = await gameQuery(
      "SELECT player, game, exerciseId, solution, solutionLength, elapsed, cost, points, hint, expected, attempts FROM game_progress",
    );
    return res.status(200).send(data.rows);
  }

  const data = await gameQuery(
    "SELECT player, game, exerciseId, solutionLength, elapsed, cost, points, hint, expected, attempts FROM game_progress",
  );
  return res.status(200).send(data.rows);
};

const getState: RequestHandler = async (_req: Request, res: Response) => {
  return res.status(200).send({ mode: getGameMode() });
};

const getPlayers: RequestHandler = async (_req: Request, res: Response) => {
  const data = await gameQuery("SELECT id, name, avatar FROM players ORDER BY id");
  return res.status(200).send(data.rows);
};

const setAvatar: RequestHandler = async (req: Request, res: Response) => {
  if (getGameMode() !== "init") {
    return res.status(400).send({ message: "Avatars can only be changed before the game starts" });
  }

  const name = (req as AuthRequest).player;
  const avatar = req.body?.avatar;
  if (!Number.isInteger(avatar) || avatar < 1 || avatar > MAX_AVATAR) {
    return res.status(400).send({ message: `Avatar must be between 1 and ${MAX_AVATAR}` });
  }

  const result = await gameQuery("UPDATE players SET avatar=$2 WHERE LOWER(name)=LOWER($1)", [name, avatar]);
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
  return res.status(200).send({ mode: getGameMode(), modes: gameModes });
};

const getAdminDefinitions: RequestHandler = async (_req: Request, res: Response) => {
  return res.status(200).send(publicDefinitions(exercises, true));
};

const getOverview: RequestHandler = async (_req: Request, res: Response) => {
  const [players, progress, starts, activity, submissions] = await Promise.all([
    gameQuery("SELECT id, name, avatar FROM players ORDER BY id"),
    gameQuery(
      "SELECT player, game, exerciseId, solution, solutionLength, elapsed, cost, points, hint, expected, attempts FROM game_progress",
    ),
    gameQuery(
      "SELECT player, game, exerciseId, MIN(startTime) AS firstStart FROM game_start GROUP BY player, game, exerciseId",
    ),
    gameQuery("SELECT player, game, exerciseId, attempts, lastActiveAt, hint, expected FROM exercise_activity"),
    gameQuery(
      "SELECT id, player, game, exerciseId, solution, correct, message, submittedAt FROM submissions ORDER BY submittedAt",
    ),
  ]);

  return res.status(200).send({
    mode: getGameMode(),
    modes: gameModes,
    solutions: referenceSolutions(),
    players: players.rows,
    progress: progress.rows,
    starts: starts.rows,
    activity: activity.rows,
    submissions: submissions.rows,
  });
};

const setMode: RequestHandler = async (req: Request, res: Response) => {
  const newMode = req.body?.mode;
  if (!gameModes.includes(newMode)) {
    return res.status(400).send({ message: `Invalid mode, expected one of: ${gameModes.join(", ")}` });
  }

  await gameQuery(
    "INSERT INTO settings (key, value) VALUES ('game_mode', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [newMode],
  );
  setGameMode(newMode);
  console.log("Game mode", newMode);
  return res.status(200).send({ mode: newMode, message: `Going into ${newMode} game mode!` });
};

gameRouter.post("/register", registerUser);
gameRouter.post("/start", requirePlayer, startExercise);
gameRouter.post("/check", requirePlayer, checkExercise);
gameRouter.post("/hint", requirePlayer, getHint);
gameRouter.get("/me", requirePlayer, getMyActivity);
gameRouter.get("/solution", requirePlayer, getMySolution);
gameRouter.post("/activity", requirePlayer, recordActivity);
gameRouter.get("/", getProgress);
gameRouter.get("/state", getState);
gameRouter.get("/players", getPlayers);
gameRouter.post("/avatar", requirePlayer, setAvatar);
gameRouter.get("/admin", requireAdmin, getAdmin);
gameRouter.post("/admin/mode", requireAdmin, setMode);
gameRouter.get("/admin/overview", requireAdmin, getOverview);
gameRouter.get("/admin/definitions", requireAdmin, getAdminDefinitions);
