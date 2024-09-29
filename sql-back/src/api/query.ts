import { Client, ClientConfig } from "pg";
import { env } from "@/common/utils/envConfig";

export async function executeQuery(sql: string) {
  const options: ClientConfig = {
    user: env.PG_USER,
    database: 'world',
    password: env.PG_PASSWORD,
    port: env.PG_PORT,
    host: env.PG_HOST,
  };
  const client = new Client(options);
  await client.connect();
  const result = await client.query(sql);
  await client.end();
  return result
}
