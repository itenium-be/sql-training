/**
 * Where the frontend sends its queries.
 *
 * Everybody plays against one shared server, so these URLs must be settable
 * without rebuilding the bundle. Resolution order, first non empty wins:
 *
 *  1. window.SQL_TRAINING_CONFIG  - written by docker-entrypoint.sh from the
 *                                   API_URL / LEADERBOARD_URL env vars, so the
 *                                   same image can be pointed anywhere.
 *  2. VITE_API_URL / VITE_LEADERBOARD_URL - for `npm run dev`, see .env.development.
 *  3. The defaults below.
 */

type RuntimeConfig = {
  api?: string;
  leaderboardApi?: string;
};

declare global {
  interface Window {
    SQL_TRAINING_CONFIG?: RuntimeConfig;
  }
}

// TODO: point these at the machine hosting the game.
const DEFAULT_API = 'http://replace-me.example.com:8080';
const DEFAULT_LEADERBOARD_API = 'http://replace-me.example.com:4001';

function resolve(runtime: string | undefined, buildTime: string | undefined, fallback: string): string {
  const value = [runtime, buildTime, fallback].find(candidate => !!candidate && candidate.trim().length) ?? fallback;
  return value.trim().replace(/\/+$/, '');
}

const runtime = window.SQL_TRAINING_CONFIG ?? {};

export const config = {
  api: resolve(runtime.api, import.meta.env.VITE_API_URL, DEFAULT_API),
  leaderboard: {
    api: resolve(runtime.leaderboardApi, import.meta.env.VITE_LEADERBOARD_URL, DEFAULT_LEADERBOARD_API),
  },
}

export type HttpResponse<T = unknown> = {
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
}

/** One row of whatever the player's query returned. */
export type QueryRow = Record<string, unknown>;

/** What the database had to do to answer the query. Load independent by design. */
export type QueryCost = {
  reads: number;
  plannerCost: number;
  rowsScanned: number;
}

export type QueryResponse = {
  rows: QueryRow[];
  truncated: boolean;
  cost: QueryCost;
}
