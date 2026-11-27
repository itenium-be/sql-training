import { PlayerRow } from '../leaderboard/leaderboardData';

export type BadgeKind = 'solved' | 'fastest' | 'shortest' | 'leanest';
export type PodiumBadge = { kind: BadgeKind; value: number; text: string; tip: string };

const exercises = (n: number) => `${n} exercise${n === 1 ? '' : 's'}`;

export function podiumBadges(row: PlayerRow): PodiumBadge[] {
  return [
    { kind: 'solved', value: row.solved, text: `${row.solved}/${row.totalExercises}`, tip: `Solved ${row.solved} of ${exercises(row.totalExercises)}` },
    { kind: 'fastest', value: row.fastest, text: `${row.fastest}`, tip: `Fastest solve on ${exercises(row.fastest)}` },
    { kind: 'shortest', value: row.shortest, text: `${row.shortest}`, tip: `Shortest query on ${exercises(row.shortest)}` },
    { kind: 'leanest', value: row.leanest, text: `${row.leanest}`, tip: `Fewest reads on ${exercises(row.leanest)}` },
  ];
}
