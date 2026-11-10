import { GameMode } from '../game';
import { Score } from '../exercises/exerciseModels';

export type PlayerInfo = { id: number; name: string; avatar: number | null };
type ReferenceSolution = { game: string; exerciseId: number; desc: string; points: number; solution: string };
type ExerciseStartRow = { player: string; game: string; exerciseid: number; firststart: string };
type ActivityRow = { player: string; game: string; exerciseid: number; attempts: number; lastactiveat: string | null; hint: boolean; expected: boolean };
type AdminSubmission = {
  id: number; player: string; game: string; exerciseid: number;
  correct: boolean; submittedat: string; solution: string; message: string | null;
};

export type AdminOverview = {
  mode: GameMode;
  modes: GameMode[];
  players: PlayerInfo[];
  progress: Score[];
  solutions: ReferenceSolution[];
  starts: ExerciseStartRow[];
  activity: ActivityRow[];
  submissions: AdminSubmission[];
};

export type ActivityState = 'active' | 'recent' | 'idle';

const RECENT_SEC = 30;
export const IDLE_SEC = 300;

export function activityLevel(secondsAgo: number | null): ActivityState {
  if (secondsAgo === null) return 'idle';
  if (secondsAgo < RECENT_SEC) return 'active';
  if (secondsAgo < IDLE_SEC) return 'recent';
  return 'idle';
}

export function humanDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h${rem}m` : `${h}h`;
}

export type StuckRow = {
  game: string;
  exerciseid: number;
  desc: string;
  runningSec: number;
  wrong: number;
  lastWrongSec: number | null;
  lastActiveSec: number | null;
  hint: boolean;
  expected: boolean;
};

const key = (game: string, exerciseId: number) => `${game}-${exerciseId}`;
const ageSec = (iso: string, nowMs: number) => Math.round((nowMs - Date.parse(iso)) / 1000);

export function stuckRows(player: string, o: AdminOverview, nowMs: number): StuckRow[] {
  const solved = new Set(o.progress.filter(p => p.player === player).map(p => key(p.game, p.exerciseid)));
  const descOf = new Map(o.solutions.map(s => [key(s.game, s.exerciseId), s.desc]));

  return o.starts
    .filter(s => s.player === player && !solved.has(key(s.game, s.exerciseid)))
    .map(s => {
      const k = key(s.game, s.exerciseid);
      const wrongs = o.submissions.filter(
        x => x.player === player && key(x.game, x.exerciseid) === k && !x.correct,
      );
      const lastWrong = wrongs.reduce<number | null>((min, x) => {
        const a = ageSec(x.submittedat, nowMs);
        return min === null || a < min ? a : min;
      }, null);
      const act = o.activity.find(a => a.player === player && key(a.game, a.exerciseid) === k);
      return {
        game: s.game,
        exerciseid: s.exerciseid,
        desc: descOf.get(k) ?? `#${s.exerciseid}`,
        runningSec: ageSec(s.firststart, nowMs),
        wrong: wrongs.length,
        lastWrongSec: lastWrong,
        lastActiveSec: act?.lastactiveat ? ageSec(act.lastactiveat, nowMs) : null,
        hint: act?.hint ?? false,
        expected: act?.expected ?? false,
      };
    });
}
