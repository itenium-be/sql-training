import sql from "mssql";
import { Client } from "pg";
import { pgConfig, sqlConfig } from "../query";

type PlanNode = Record<string, any>;

const BUFFER_KEYS = [
  "Shared Hit Blocks",
  "Shared Read Blocks",
  "Local Hit Blocks",
  "Local Read Blocks",
  "Temp Read Blocks",
  "Temp Written Blocks",
];

export class CostError extends Error {}

function singleStatement(query: string) {
  const trimmed = query.trim().replace(/;\s*$/, "");
  if (!trimmed) {
    throw new CostError("Empty query");
  }
  if (trimmed.includes(";")) {
    throw new CostError("Only a single statement can be measured");
  }
  return trimmed;
}

export async function measurePostgres(query: string): Promise<number> {
  const statement = singleStatement(query);
  const client = new Client(pgConfig());
  await client.connect();
  try {
    const result = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${statement}`);
    const plan: PlanNode = result.rows[0]["QUERY PLAN"][0].Plan;
    return BUFFER_KEYS.reduce((total, key) => total + (plan[key] ?? 0), 0);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function measureSqlServer(query: string): Promise<number> {
  if (/statistics/i.test(query)) {
    throw new CostError("Changing STATISTICS settings is not allowed");
  }
  const pool = await new sql.ConnectionPool({ ...sqlConfig, pool: { max: 1, min: 0 } }).connect();
  try {
    let reads = 0;
    const request = pool.request();
    request.on("info", (info: { message: string }) => {
      for (const match of info.message.matchAll(/logical reads (\d+)/g)) {
        reads += Number(match[1]);
      }
    });
    await request.batch(`SET STATISTICS IO ON;\n${query}`);
    return reads;
  } finally {
    await pool.close().catch(() => {});
  }
}
