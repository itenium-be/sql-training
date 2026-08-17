import { executeQuery } from "./query";

/**
 * Brings an existing leaderboard database up to date on boot.
 *
 * sql-data/game.sql only runs on an empty postgres volume, so without this a
 * running leaderboard would have to be wiped (losing everybody's scores) just
 * to pick up the extra scoring columns.
 */
export async function ensureSchema(): Promise<void> {
  const statements = [
    "ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS attempts NUMERIC(15,0) DEFAULT 1",
    "ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS hintsUsed NUMERIC(15,0) DEFAULT 0",
    "ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS reads NUMERIC(15,0) DEFAULT 0",
    "ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS plannerCost NUMERIC(15,0) DEFAULT 0",
    "ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS rowsScanned NUMERIC(15,0) DEFAULT 0",
    // Formatted SQL is longer than what people used to type by hand, and losing a
    // score to "value too long for type character varying(900)" is a rotten way
    // to find that out.
    "ALTER TABLE game_progress ALTER COLUMN solution TYPE TEXT",
  ];

  for (const statement of statements) {
    await executeQuery(statement);
  }
}
