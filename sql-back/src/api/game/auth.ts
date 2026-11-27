import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { gameQuery } from "./gameDb";

let secret: string | null = null;

async function getSecret(): Promise<string> {
  if (secret) {
    return secret;
  }
  await gameQuery("INSERT INTO settings (key, value) VALUES ('jwt_secret', $1) ON CONFLICT (key) DO NOTHING", [
    randomBytes(48).toString("hex"),
  ]);
  const result = await gameQuery("SELECT value FROM settings WHERE key='jwt_secret'");
  secret = result.rows[0].value as string;
  return secret;
}

export async function mintToken(player: string): Promise<string> {
  return jwt.sign({ sub: player }, await getSecret(), { algorithm: "HS256" });
}

export type AuthRequest = Request & { player: string };

function bearerToken(req: Request): string {
  const header = req.header("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

export async function requirePlayer(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).send({ message: "Not registered" });
    return;
  }
  try {
    const payload = jwt.verify(token, await getSecret(), { algorithms: ["HS256"] });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error("Invalid token");
    }
    (req as AuthRequest).player = payload.sub;
    next();
  } catch {
    res.status(401).send({ message: "Invalid token, please register again" });
  }
}

/** Lets anonymous viewers through, such as the beamer once the game has ended. */
export async function optionalPlayer(req: Request, res: Response, next: NextFunction) {
  if (!bearerToken(req)) {
    next();
    return;
  }
  await requirePlayer(req, res, next);
}
