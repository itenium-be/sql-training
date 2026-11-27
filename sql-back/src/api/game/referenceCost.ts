const costs = new Map<string, number>();

export async function referenceCost(
  game: string,
  exerciseId: number,
  measure: () => Promise<number | null>,
): Promise<number | null> {
  const key = `${game}-${exerciseId}`;
  const cached = costs.get(key);
  if (cached !== undefined) return cached;
  const cost = await measure();
  if (cost !== null) costs.set(key, cost);
  return cost;
}
