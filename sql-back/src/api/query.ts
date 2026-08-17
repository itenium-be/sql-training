import { Pool, type PoolConfig, type QueryResult } from "pg";
import sql, { type ConnectionPool } from "mssql";
import { env } from "@/common/utils/envConfig";

/**
 * How much work the database had to do to answer a query.
 *
 * Everything in here is deliberately load independent: no wall clock timings,
 * so a busy server never changes anybody's score. Run the same query on an
 * idle server or while 30 people are hammering it and you get the same numbers.
 */
export type QueryCost = {
  /** Buffer blocks (postgres) or logical reads (sql server) touched. Lower is better. */
  reads: number;
  /** What the query planner estimated this would cost. Lower is better. */
  plannerCost: number;
  /** Rows the plan walked over, summed across every node. Lower is better. */
  rowsScanned: number;
};

export type PlayerQueryResult = {
  rows: any[];
  /** True when we cut the result off at QUERY_MAX_ROWS. */
  truncated: boolean;
  cost: QueryCost;
};

const noCost: QueryCost = { reads: 0, plannerCost: 0, rowsScanned: 0 };

const pgBase: PoolConfig = {
  database: "world",
  host: env.PG_HOST,
  port: env.PG_PORT,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

/** Owns the data: used for the sample data endpoints, never for player SQL. */
const adminPool = new Pool({ ...pgBase, user: env.PG_USER, password: env.PG_PASSWORD });

/** Read only role: this is what the players' SQL runs as. */
const playerPool = new Pool({ ...pgBase, user: env.PG_PLAYER_USER, password: env.PG_PLAYER_PASSWORD });

// A pool emits errors for idle clients dropped by the server. Without a listener
// node treats those as unhandled and kills the process, which on a shared server
// means one stale connection takes the game down for everyone.
adminPool.on("error", (err) => console.error("postgres admin pool error", err.message));
playerPool.on("error", (err) => console.error("postgres player pool error", err.message));

let playerRoleWarned = false;

/** Runs trusted, app-owned SQL (sample data). */
export async function executeQuery(text: string): Promise<QueryResult> {
  return adminPool.query(text);
}

/**
 * `pg` returns an array of results when the SQL contains several statements.
 * The last one is what the player is showing us.
 */
function lastResult(result: QueryResult | QueryResult[]): QueryResult {
  return Array.isArray(result) ? result[result.length - 1] : result;
}

function summarisePlan(root: any): QueryCost {
  let reads = 0;
  let rowsScanned = 0;

  const walk = (node: any) => {
    reads +=
      (node["Shared Hit Blocks"] ?? 0) +
      (node["Shared Read Blocks"] ?? 0) +
      (node["Local Hit Blocks"] ?? 0) +
      (node["Local Read Blocks"] ?? 0) +
      (node["Temp Read Blocks"] ?? 0) +
      (node["Temp Written Blocks"] ?? 0);
    rowsScanned += (node["Actual Rows"] ?? 0) * (node["Actual Loops"] ?? 1);
    for (const child of node.Plans ?? []) {
      walk(child);
    }
  };
  walk(root);

  return { reads, plannerCost: Math.round(root["Total Cost"] ?? 0), rowsScanned };
}

/**
 * Second pass over the query to collect the plan. Costs an extra execution, but
 * the training datasets are tiny and it keeps the scoring numbers honest.
 * Never fatal: a query we cannot EXPLAIN just scores no efficiency bonus.
 */
async function explainPostgres(client: any, text: string): Promise<QueryCost> {
  try {
    const explained = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${text}`);
    const plan = lastResult(explained).rows[0]["QUERY PLAN"][0].Plan;
    return summarisePlan(plan);
  } catch (err: any) {
    console.warn("could not EXPLAIN player query:", err.message);
    return noCost;
  }
}

async function runPostgres(pool: Pool, text: string, readOnlyTransaction: boolean): Promise<PlayerQueryResult> {
  const client = await pool.connect();
  try {
    await client.query(readOnlyTransaction ? "BEGIN READ ONLY" : "BEGIN");
    await client.query(`SET LOCAL statement_timeout = ${env.QUERY_TIMEOUT_MS}`);

    const rows = lastResult(await client.query(text)).rows ?? [];
    const cost = await explainPostgres(client, text);

    return {
      rows: rows.slice(0, env.QUERY_MAX_ROWS),
      truncated: rows.length > env.QUERY_MAX_ROWS,
      cost,
    };
  } finally {
    // Nothing a player types is ever allowed to stick.
    await client.query("ROLLBACK").catch(() => undefined);
    client.release();
  }
}

/** Auth / missing-role failures, as opposed to "your SQL is wrong". */
function isConnectionProblem(err: any): boolean {
  return ["28P01", "28000", "3D000", "ECONNREFUSED", "ENOTFOUND"].includes(err?.code);
}

export async function executePlayerQueryPostgres(text: string): Promise<PlayerQueryResult> {
  try {
    return await runPostgres(playerPool, text, true);
  } catch (err: any) {
    if (!isConnectionProblem(err)) {
      throw err;
    }

    // The read only role lives in sql-data/postgres-roles.sql, which only runs on a
    // fresh volume. Rather than break the game for an existing database, fall back to
    // the admin role in a READ ONLY transaction and make some noise about it.
    if (!playerRoleWarned) {
      playerRoleWarned = true;
      console.warn(
        `Cannot connect as "${env.PG_PLAYER_USER}" (${err.message}). Falling back to the admin role ` +
          "in a READ ONLY transaction. Recreate the postgres volume (docker compose down -v) to get " +
          "the stronger read only role back.",
      );
    }
    return runPostgres(adminPool, text, true);
  }
}

export const sqlConfig = {
  user: env.SQL_SERVER_USER,
  password: env.SQL_SERVER_PASSWORD,
  database: "sportdb",
  server: env.SQL_SERVER_HOST,
  port: env.SQL_SERVER_PORT,
  requestTimeout: env.QUERY_TIMEOUT_MS,
  connectionTimeout: 15000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    trustServerCertificate: true,
  },
};

let mssqlPool: Promise<ConnectionPool> | null = null;

/**
 * One pool for the whole process. The old code called sql.connect() per request,
 * which under a room full of people fights over a single global connection.
 */
function getMssqlPool(): Promise<ConnectionPool> {
  if (!mssqlPool) {
    const pool = new sql.ConnectionPool(sqlConfig);
    pool.on("error", (err) => console.error("sql server pool error", err.message));
    mssqlPool = pool.connect().catch((err) => {
      mssqlPool = null; // let the next request try again
      throw err;
    });
  }
  return mssqlPool;
}

/** "Table 'goals'. Scan count 1, logical reads 12, physical reads 0, ..." */
function parseLogicalReads(message: string): number {
  let total = 0;
  const pattern = /logical reads (\d+)/gi;
  let match = pattern.exec(message);
  while (match) {
    total += Number.parseInt(match[1], 10);
    match = pattern.exec(message);
  }
  return total;
}

export async function executePlayerQuerySqlServer(text: string): Promise<PlayerQueryResult> {
  const pool = await getMssqlPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const request = transaction.request();
    let reads = 0;
    request.on("info", (info: any) => {
      reads += parseLogicalReads(info?.message ?? "");
    });

    // STATISTICS IO has to share the batch with the query to report on it.
    const result = await request.batch(`SET STATISTICS IO ON;\n${text}`);
    const recordsets: any[][] = (result.recordsets as any[][]) ?? [];
    const rows = recordsets.length ? (recordsets[recordsets.length - 1] ?? []) : [];

    return {
      rows: rows.slice(0, env.QUERY_MAX_ROWS),
      truncated: rows.length > env.QUERY_MAX_ROWS,
      cost: { reads, plannerCost: 0, rowsScanned: rows.length },
    };
  } finally {
    // SQL Server rolls back DDL too, so a stray DROP TABLE never survives.
    await transaction.rollback().catch(() => undefined);
  }
}
