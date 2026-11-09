import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { executeQuery } from "./query";

let secret: string | null = null;

async function getSecret(): Promise<string> {
  if (secret) {
    return secret;
  }
  await executeQuery(
    "INSERT INTO settings (key, value) VALUES ('jwt_secret', $1) ON CONFLICT (key) DO NOTHING",
    [randomBytes(48).toString("hex")],
  );
  const result = await executeQuery("SELECT value FROM settings WHERE key='jwt_secret'");
  secret = result.rows[0].value as string;
  return secret;
}

export async function mintToken(player: string): Promise<string> {
  return jwt.sign({ sub: player }, await getSecret(), { algorithm: "HS256" });
}

export type AuthRequest = Request & { player: string };

export async function requirePlayer(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
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
