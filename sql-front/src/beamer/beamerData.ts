import { Score } from '../exercises/exerciseModels';
import { ExerciseAward } from '../leaderboard/leaderboardData';

export type MyResult = { elapsed: number; chars: number };

export type SolutionTag = 'fastest' | 'shortest' | 'leanest';

export type SolutionCard = {
  player: string;
  isYou: boolean;
  tags: SolutionTag[];
  solution: string;
};

export function exerciseSolutions(scores: Score[], you: string, award: ExerciseAward): SolutionCard[] {
  const sqlFor = (player: string) =>
    scores.find(s => s.game === award.game && s.exerciseid === award.exerciseId && s.player === player)?.solution ?? '';

  const holders: [SolutionTag, string | undefined][] = [
    ['fastest', award.fastest?.player],
    ['shortest', award.shortest?.player],
    ['leanest', award.leanest?.player],
  ];

  const cards: SolutionCard[] = [];
  holders.forEach(([tag, player]) => {
    if (!player) {
      return;
    }
    const existing = cards.find(c => c.player === player);
    if (existing) {
      existing.tags.push(tag);
    } else {
      cards.push({ player, isYou: player === you, tags: [tag], solution: sqlFor(player) });
    }
  });

  if (you && !cards.some(c => c.isYou) && sqlFor(you)) {
    cards.push({ player: you, isYou: true, tags: [], solution: sqlFor(you) });
  }

  return cards;
}

export function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function myExerciseResult(scores: Score[], player: string, game: string, exerciseId: number): MyResult | null {
  const mine = scores.find(s => s.player === player && s.game === game && s.exerciseid === exerciseId);
  return mine ? { elapsed: mine.elapsed, chars: mine.solutionlength } : null;
}
