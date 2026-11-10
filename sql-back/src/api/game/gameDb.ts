import { Client, type ClientConfig } from "pg";
import { env } from "@/common/utils/envConfig";

export async function gameQuery(sql: string, values: any = undefined) {
  const options: ClientConfig = {
    user: env.GAME_PG_USER,
    database: "game",
    password: env.GAME_PG_PASSWORD,
    port: env.GAME_PG_PORT,
    host: env.GAME_PG_HOST,
  };
  const client = new Client(options);
  await client.connect();
  const result = await client.query(sql, values);
  await client.end();
  return result;
}

export async function migrate() {
  await gameQuery("ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS cost NUMERIC(15,0)");
  await gameQuery("ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS points NUMERIC(15,0)");
  await gameQuery("ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS hint BOOLEAN NOT NULL DEFAULT FALSE");
  await gameQuery("ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS attempts NUMERIC(15,0) NOT NULL DEFAULT 0");
  await gameQuery(`CREATE TABLE IF NOT EXISTS exercise_activity (
    player VARCHAR(100) NOT NULL,
    game VARCHAR(50) NOT NULL,
    exerciseId NUMERIC(15,0) NOT NULL,
    attempts NUMERIC(15,0) NOT NULL DEFAULT 0,
    hint BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (player, game, exerciseId)
  )`);
  await gameQuery("ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS expected BOOLEAN NOT NULL DEFAULT FALSE");
  await gameQuery("ALTER TABLE exercise_activity ADD COLUMN IF NOT EXISTS expected BOOLEAN NOT NULL DEFAULT FALSE");
  await gameQuery("ALTER TABLE exercise_activity ADD COLUMN IF NOT EXISTS lastActiveAt TIMESTAMP");
  await gameQuery("CREATE UNIQUE INDEX IF NOT EXISTS game_progress_unique ON game_progress (player, game, exerciseId)");
  await gameQuery("CREATE TABLE IF NOT EXISTS settings (key VARCHAR(50) PRIMARY KEY, value TEXT NOT NULL)");
  await gameQuery("ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar SMALLINT");
  await gameQuery(`CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    player VARCHAR(100) NOT NULL,
    game VARCHAR(50) NOT NULL,
    exerciseId NUMERIC(15,0) NOT NULL,
    solution TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    message TEXT,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}
