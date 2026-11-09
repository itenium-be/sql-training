export const ATTEMPTS_PER_PENALTY = 3;

export function calculatePoints(basePoints: number, hint: boolean, wrongAttempts: number): number {
  const afterHint = hint ? Math.ceil(basePoints / 2) : basePoints;
  return Math.max(1, afterHint - Math.floor(wrongAttempts / ATTEMPTS_PER_PENALTY));
}
