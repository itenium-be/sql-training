export const ATTEMPTS_PER_PENALTY = 3;

export type Help = {
  hint: boolean;
  hintCost: number;
  expected: boolean;
  expectedCost: number;
};

export function calculatePoints(basePoints: number, help: Help, wrongAttempts: number): number {
  const helpCost = (help.hint ? help.hintCost : 0) + (help.expected ? help.expectedCost : 0);
  return Math.max(1, basePoints - helpCost - Math.floor(wrongAttempts / ATTEMPTS_PER_PENALTY));
}
