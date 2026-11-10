import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const gameRegistry = new OpenAPIRegistry();

const player = gameRegistry.registerComponent("securitySchemes", "player", {
  type: "http",
  scheme: "bearer",
  description: "The token from POST /game/register",
});
const admin = gameRegistry.registerComponent("securitySchemes", "admin", {
  type: "apiKey",
  in: "header",
  name: "x-api-key",
});

const exercise = { game: z.string(), exerciseId: z.number().int() };
const json = (schema: z.ZodObject) => ({ body: { content: { "application/json": { schema } } } });
const ok = { 200: { description: "OK" } };

type Doc = {
  method: "get" | "post";
  path: string;
  summary: string;
  description?: string;
  auth?: "player" | "admin";
  request?: Record<string, unknown>;
};

const docs: Doc[] = [
  {
    method: "post",
    path: "/register",
    summary: "Register a player",
    description: "Returns the bearer token for the player endpoints. Names are unique.",
    request: json(z.object({ name: z.string() })),
  },
  {
    method: "post",
    path: "/start",
    summary: "Open an exercise and start its timer",
    description:
      "The only way to get the question (text, expected columns, order) while the game runs. The timer counts from the first start; refused in the lobby.",
    auth: "player",
    request: json(z.object(exercise)),
  },
  {
    method: "post",
    path: "/check",
    summary: "Submit a solution",
    description: "Scores it while the game runs. Requires a start for that exercise.",
    auth: "player",
    request: json(z.object({ ...exercise, solution: z.string() })),
  },
  {
    method: "post",
    path: "/hint",
    summary: "Reveal the hint or the expected result",
    description: "Costs points while the game runs. Requires a start for that exercise.",
    auth: "player",
    request: json(z.object({ ...exercise, type: z.enum(["hint", "expected"]) })),
  },
  {
    method: "get",
    path: "/me",
    summary: "Your attempts, revealed help and opened exercises",
    description: "`exercises` holds the question of every exercise you started.",
    auth: "player",
  },
  {
    method: "get",
    path: "/solution",
    summary: "Your accepted solution and its result",
    auth: "player",
    request: { query: z.object({ game: z.string(), exerciseId: z.coerce.number().int() }) },
  },
  {
    method: "post",
    path: "/activity",
    summary: "Mark an exercise as being worked on",
    description: "Feeds the admin's 'stuck' view.",
    auth: "player",
    request: json(z.object(exercise)),
  },
  {
    method: "post",
    path: "/avatar",
    summary: "Pick an avatar",
    description: "Only in the lobby.",
    auth: "player",
    request: json(z.object({ avatar: z.number().int() })),
  },
  {
    method: "get",
    path: "/",
    summary: "All scores",
    description: "Empty in the lobby; solutions are included once the game has ended.",
  },
  { method: "get", path: "/state", summary: "Current game mode" },
  { method: "get", path: "/players", summary: "Registered players and their avatars" },
  { method: "get", path: "/admin", summary: "Current and available game modes", auth: "admin" },
  {
    method: "post",
    path: "/admin/mode",
    summary: "Switch the game mode",
    description: "init (lobby), running (scored), end (closed, solutions visible).",
    auth: "admin",
    request: json(z.object({ mode: z.enum(["init", "running", "end"]) })),
  },
  {
    method: "get",
    path: "/admin/overview",
    summary: "Everything the admin dashboard shows",
    description: "Players, scores, starts, activity, submissions and reference solutions.",
    auth: "admin",
  },
  {
    method: "get",
    path: "/admin/definitions",
    summary: "All exercises including the questions",
    auth: "admin",
  },
];

for (const { auth, path, ...doc } of docs) {
  gameRegistry.registerPath({
    ...doc,
    path: `/game${path === "/" ? "" : path}`,
    tags: [auth === "admin" ? "Game admin" : "Game"],
    ...(auth && { security: [{ [auth === "admin" ? admin.name : player.name]: [] }] }),
    responses: ok,
  });
}
