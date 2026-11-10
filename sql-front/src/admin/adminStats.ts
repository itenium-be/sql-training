import { Score } from '../exercises/exerciseModels';
import { ExerciseAward } from '../leaderboard/leaderboardData';
import { AdminOverview, IDLE_SEC } from './adminData';

const ageSec = (iso: string, nowMs: number) => (nowMs - Date.parse(iso)) / 1000;
const key = (game: string, exerciseId: number) => `${game}-${exerciseId}`;

export type OverviewStats = {
  registered: number;
  avatarsChosen: number;
  activeNow: number;
  idle: number;
  submissionsPerMin: number;
  fullySolved: number;
};

export function overviewStats(o: AdminOverview, nowMs: number, totalExercises: number): OverviewStats {
  const active = new Set(
    o.activity.filter(a => a.lastactiveat && ageSec(a.lastactiveat, nowMs) < IDLE_SEC).map(a => a.player),
  );
  const solvedCount = new Map<string, number>();
  o.progress.forEach(p => solvedCount.set(p.player, (solvedCount.get(p.player) ?? 0) + 1));

  return {
    registered: o.players.length,
    avatarsChosen: o.players.filter(p => p.avatar !== null).length,
    activeNow: active.size,
    idle: o.players.length - active.size,
    submissionsPerMin: o.submissions.filter(s => ageSec(s.submittedat, nowMs) <= 60).length,
    fullySolved: totalExercises > 0
      ? [...solvedCount.values()].filter(n => n >= totalExercises).length
      : 0,
  };
}

export type WinningSolution = { tag: 'Fastest' | 'Shortest' | 'Leanest'; player: string; solution: string };

export function winningSolutions(award: ExerciseAward, progress: Score[]): WinningSolution[] {
  const solutionFor = (player: string) =>
    progress.find(p => p.player === player && key(p.game, p.exerciseid) === key(award.game, award.exerciseId))?.solution ?? '';

  const holders: [WinningSolution['tag'], string | undefined][] = [
    ['Fastest', award.fastest?.player],
    ['Shortest', award.shortest?.player],
    ['Leanest', award.leanest?.player],
  ];
  return holders
    .filter((h): h is [WinningSolution['tag'], string] => !!h[1])
    .map(([tag, player]) => ({ tag, player, solution: solutionFor(player) }));
}
