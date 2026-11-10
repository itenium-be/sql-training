import { authFetch, config } from '../config';
import { ExerciseId } from './exerciseModels';

export const PING_THROTTLE_MS = 20_000;

export function shouldPing(lastPingMs: number | null, nowMs: number): boolean {
  return lastPingMs === null || nowMs - lastPingMs >= PING_THROTTLE_MS;
}

const lastPing = new Map<string, number>();

/**
 * Tells the leaderboard the player is still working on an exercise, so the admin can
 * tell "typing" from "stuck and gone quiet". Fire-and-forget: a failure never disturbs
 * editing. Throttled per exercise so the editor's linter does not hammer the server.
 */
export function pingActivity(game: ExerciseId, exerciseId: number): void {
  const key = `${game}-${exerciseId}`;
  const now = Date.now();
  if (!shouldPing(lastPing.get(key) ?? null, now)) return;
  lastPing.set(key, now);
  authFetch(`${config.api}/game/activity`, {
    method: 'POST',
    body: JSON.stringify({ game, exerciseId }),
  }).catch(() => {});
}
