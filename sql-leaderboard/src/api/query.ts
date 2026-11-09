import { Client, ClientConfig } from "pg";
import { env } from "../envConfig";

export async function executeQuery(sql: string, values: any = undefined) {
  const options: ClientConfig = {
    user: env.PG_USER,
    database: 'game',
    password: env.PG_PASSWORD,
    port: env.PG_PORT,
    host: env.PG_HOST,
  };
  const client = new Client(options);
  await client.connect();
  const result = await client.query(sql, values);
  await client.end();
  return result
}

export async function migrate() {
  await executeQuery('ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS cost NUMERIC(15,0)');
  await executeQuery('ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar SMALLINT');
}
