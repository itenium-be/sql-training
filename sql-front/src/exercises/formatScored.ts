export function formatScored(points: number, max: number): string {
  return points === max ? `Scored: ${points} pts` : `Scored: ${points} / ${max} pts`;
}
