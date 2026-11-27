import { Score } from './exerciseModels';
import { formatClock, SolutionTag } from '../beamer/beamerData';

export type PlayerSolution = { player: string; solution: string };

export function withSolutions(scores: Score[], game: string, exerciseId: number, solutions: PlayerSolution[]): Score[] {
  return scores.map(s => s.game === game && s.exerciseid === exerciseId
    ? {...s, solution: solutions.find(x => x.player === s.player)?.solution}
    : s);
}

export type Metric = { kind: SolutionTag; value: string; tip: string; won: boolean };

const TIPS: Record<SolutionTag, [plain: string, won: string]> = {
  fastest: ['Time to solve', 'Fastest: solved quicker than anyone'],
  shortest: ['Characters, whitespace ignored', 'Shortest: fewest characters, whitespace ignored'],
  leanest: ['Pages read by the query', 'Leanest: fewest pages read'],
};

export function cardMetrics(m: {elapsed?: number; chars: number; reads: number | null}, won: SolutionTag[]): Metric[] {
  const values: [SolutionTag, string | null][] = [
    ['fastest', m.elapsed === undefined ? null : formatClock(m.elapsed)],
    ['shortest', `${m.chars} ch`],
    ['leanest', m.reads === null ? null : `${m.reads} reads`],
  ];
  return values
    .filter((v): v is [SolutionTag, string] => v[1] !== null)
    .map(([kind, value]) => {
      const isWon = won.includes(kind);
      return { kind, value, tip: TIPS[kind][isWon ? 1 : 0], won: isWon };
    });
}
