import { Client, ClientConfig, QueryConfig } from "pg";
import { env } from "@/common/utils/envConfig";

const QUERY_TIMEOUT_MS = 5000;

function pgOptions(): ClientConfig {
  return {
    user: env.PG_USER,
    database: 'world',
    password: env.PG_PASSWORD,
    port: env.PG_PORT,
    host: env.PG_HOST,
    statement_timeout: QUERY_TIMEOUT_MS,
    query_timeout: QUERY_TIMEOUT_MS + 2000,
    connectionTimeoutMillis: 5000,
  };
}

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  const client = new Client(pgOptions());
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function executeQuery(sql: string) {
  return withClient(client => client.query(sql));
}

export async function executeArrayQuery(sql: string) {
  return withClient(client => client.query({ text: sql, rowMode: 'array' }));
}

export async function explainQuery(sql: string) {
  return withClient(client => client.query({ text: sql, queryMode: 'extended' } as QueryConfig));
}


export const sqlConfig = {
  user: env.SQL_SERVER_USER,
  password: env.SQL_SERVER_PASSWORD,
  database: 'sportdb',
  server: env.SQL_SERVER_HOST,
  port: env.SQL_SERVER_PORT,
  requestTimeout: QUERY_TIMEOUT_MS,
  connectionTimeout: 5000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustServerCertificate: true
  }
}
