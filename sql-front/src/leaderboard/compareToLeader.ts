export type LeaderComparison =
  | { kind: 'best' }
  | { kind: 'tied'; leader: string }
  | { kind: 'behind'; leader: string; gap: number }
  | { kind: 'none' };

export function compareToLeader(
  yours: number | null,
  holder: { player: string; value: number } | null,
  you: string,
): LeaderComparison {
  if (yours === null || !holder) return { kind: 'none' };
  if (holder.player === you) return { kind: 'best' };
  if (yours === holder.value) return { kind: 'tied', leader: holder.player };
  return { kind: 'behind', leader: holder.player, gap: yours - holder.value };
}
