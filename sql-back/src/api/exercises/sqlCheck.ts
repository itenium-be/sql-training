import sql from "mssql";
import { executeQuery, explainQuery, sqlConfig } from "../query";

export type SqlProblem = {
  message: string;
  from: number;
  to: number;
};

export type SqlSchema = Record<string, string[]>;

const EXPLAIN_PREFIX = "EXPLAIN ";
const schemaCache = new Map<string, SqlSchema>();

function isSqlServer(game: string) {
  return game === "Worldcup";
}

function tokenEnd(text: string, from: number) {
  const match = /^("[^"]*"|\[[^\]]*\]|[\w$#@.]+)/.exec(text.slice(from));
  return from + (match ? match[0].length : 1);
}

function lineRange(text: string, line: number) {
  const lines = text.split("\n");
  const index = Math.min(Math.max(line, 1), lines.length) - 1;
  const start = lines.slice(0, index).reduce((len, l) => len + l.length + 1, 0);
  const content = lines[index];
  const indent = content.length - content.trimStart().length;
  const end = start + content.trimEnd().length;
  return { from: Math.min(start + indent, end), to: end };
}

function nameRange(text: string, message: string) {
  const name = /['"]([^'"]+)['"]/.exec(message)?.[1];
  if (!name) {
    return null;
  }
  const escaped = name
    .split(".")
    .pop()!
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?<![\\w$#@])${escaped}(?![\\w$#@])`, "i").exec(text);
  return match ? { from: match.index, to: match.index + match[0].length } : null;
}

function toProblem(text: string, message: string, opts: { position?: number; line?: number }): SqlProblem {
  if (opts.position && opts.position > EXPLAIN_PREFIX.length) {
    const from = Math.min(opts.position - 1 - EXPLAIN_PREFIX.length, Math.max(text.length - 1, 0));
    return { message, from, to: Math.min(tokenEnd(text, from), text.length) };
  }
  const byName = nameRange(text, message);
  if (byName) {
    return { message, ...byName };
  }
  return { message, ...lineRange(text, opts.line ?? 1) };
}

async function checkPostgres(text: string): Promise<SqlProblem[]> {
  try {
    await explainQuery(EXPLAIN_PREFIX + text);
    return [];
  } catch (err: any) {
    const position = err.position ? parseInt(err.position, 10) : undefined;
    const message = /multiple commands/.test(err.message) ? "Only one statement at a time please" : err.message;
    return [toProblem(text, message, { position })];
  }
}

async function checkSqlServer(text: string): Promise<SqlProblem[]> {
  try {
    const pool = await sql.connect(sqlConfig);
    await pool.request().input("tsql", sql.NVarChar(sql.MAX), text).execute("sp_describe_first_result_set");
    return [];
  } catch (err: any) {
    const all = [...(err.precedingErrors ?? []), err];
    const real = all.filter((e) => e.message && !(e.number >= 11500 && e.number < 11600));
    if (!real.length && all.some((e) => e.number >= 11500 && e.number < 11600)) {
      return [];
    }
    return real.map((e) => toProblem(text, e.message, { line: e.lineNumber }));
  }
}

export async function checkSql(game: string, text: string): Promise<SqlProblem[]> {
  if (!text.trim()) {
    return [];
  }
  return isSqlServer(game) ? checkSqlServer(text) : checkPostgres(text);
}

export async function getSchema(game: string): Promise<SqlSchema> {
  const key = isSqlServer(game) ? "mssql" : "pg";
  const cached = schemaCache.get(key);
  if (cached) {
    return cached;
  }

  let rows: { table_name: string; column_name: string }[];
  if (key === "mssql") {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .query(
        "SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME, ORDINAL_POSITION",
      );
    rows = result.recordset;
  } else {
    const result = await executeQuery(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position",
    );
    rows = result.rows;
  }

  const schema: SqlSchema = {};
  for (const row of rows) {
    schema[row.table_name] ??= [];
    schema[row.table_name].push(row.column_name);
  }
  schemaCache.set(key, schema);
  return schema;
}
