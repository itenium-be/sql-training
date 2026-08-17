import { env } from "@/common/utils/envConfig";

export type ScoreSubmission = {
  player: string;
  game: string;
  exerciseId: number;
  solution: string;
  attempts: number;
  hintsUsed: number;
  reads: number;
  plannerCost: number;
  rowsScanned: number;
};

/**
 * Reports a solve to the leaderboard.
 *
 * The browser used to do this, which meant every number it reported (attempts,
 * hints, how much work the query was) was whatever the player felt like
 * sending. It now travels server to server, signed with the shared internal
 * key that the leaderboard checks.
 */
export async function submitScore(submission: ScoreSubmission): Promise<void> {
  const response = await fetch(`${env.LEADERBOARD_URL}/game`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": env.INTERNAL_API_KEY,
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`leaderboard responded ${response.status}: ${body}`);
  }
}
