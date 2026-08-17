import { ExerciseModel, Score } from "../exercises/exerciseModels";
import { formatSeconds } from "./formatSeconds";

/**
 * Everything the leaderboard rewards, in one place.
 *
 * Solving an exercise is still worth the most: the per exercise points dwarf the
 * bonuses. On top of that there are three "best of the room" awards, plus two
 * bonuses anybody can earn on every exercise.
 *
 * Query length used to be worth as much as speed, which quietly taught people
 * that unreadable one-liners win prizes. It is still in, but as the smallest
 * prize on the board.
 */
export const scoringWeights = {
  /** First to solve it after opening the exercise. */
  fastest: 3,
  /** Made the database do the least work. */
  efficient: 3,
  /** Shortest SQL. Deliberately the runt of the litter. */
  leanest: 1,
  /** Solved it on the first Submit. */
  firstTry: 1,
  /** Solved it without revealing the expected result. */
  noHints: 1,
}

export type AwardKey = 'fastest' | 'efficient' | 'leanest';

type AwardDefinition = {
  title: string;
  description: string;
  column: string;
  /** Lower is better. Return null when this score cannot compete. */
  metric: (score: Score) => number | null;
  render: (value: number) => string;
}

export const awardDefinitions: Record<AwardKey, AwardDefinition> = {
  fastest: {
    title: 'Fastest Scorers',
    description: 'Least time between opening the exercise and getting it right.',
    column: 'Time',
    metric: score => (score.elapsed > 0 ? score.elapsed : null),
    render: value => formatSeconds(value),
  },
  efficient: {
    title: 'Most Efficient Queries',
    description:
      'Fewest blocks read to produce the answer. Measured from the query plan, ' +
      'so how busy the server was makes no difference.',
    column: 'Reads',
    metric: score => (score.reads > 0 ? score.reads : null),
    render: value => value.toLocaleString('nl-BE'),
  },
  leanest: {
    title: 'Leanest Solutions',
    description: 'Shortest SQL, ignoring whitespace.',
    column: 'SQL Length',
    metric: score => (score.solutionlength > 0 ? score.solutionlength : null),
    render: value => value.toString(),
  },
}

export type ExerciseAward = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  /** Everybody tied for best. A tie pays out to all of them. */
  winners: string[];
  solution?: string;
  best: number;
  average: number;
  contenders: number;
}

/** Per exercise winners of one award, for the exercises somebody has solved. */
export function calculateAward(exercises: ExerciseModel[], scores: Score[], key: AwardKey): ExerciseAward[] {
  const {metric} = awardDefinitions[key];
  const results: ExerciseAward[] = [];

  exercises.forEach(game => {
    game.exercises.forEach(ex => {
      const contenders = scores
        .filter(score => score.game === game.id && score.exerciseid === ex.id)
        .map(score => ({score, value: metric(score)}))
        .filter((entry): entry is {score: Score; value: number} => entry.value !== null);

      if (!contenders.length) {
        return;
      }

      const best = Math.min(...contenders.map(entry => entry.value));
      const winners = contenders.filter(entry => entry.value === best);

      results.push({
        game: game.id,
        exerciseId: ex.id,
        exercise: ex.desc,
        points: ex.points,
        winners: winners.map(entry => entry.score.player),
        solution: winners[0].score.solution,
        best,
        average: Math.round(contenders.reduce((total, entry) => total + entry.value, 0) / contenders.length),
        contenders: contenders.length,
      });
    });
  });

  return results;
}

export type PlayerTotal = {
  name: string;
  /** Points for solving exercises. */
  points: number;
  fastest: number;
  efficient: number;
  leanest: number;
  firstTry: number;
  noHints: number;
  bonus: number;
  total: number;
}

export function calculateTotals(exercises: ExerciseModel[], scores: Score[]): PlayerTotal[] {
  const pointsPerExercise = new Map<string, number>();
  exercises.forEach(game => {
    game.exercises.forEach(ex => pointsPerExercise.set(`${game.id}-${ex.id}`, ex.points));
  });

  const wins: Record<AwardKey, Map<string, number>> = {
    fastest: new Map(),
    efficient: new Map(),
    leanest: new Map(),
  };
  (Object.keys(wins) as AwardKey[]).forEach(key => {
    calculateAward(exercises, scores, key).forEach(award => {
      award.winners.forEach(player => wins[key].set(player, (wins[key].get(player) ?? 0) + 1));
    });
  });

  const players = new Map<string, PlayerTotal>();
  const forPlayer = (name: string): PlayerTotal => {
    if (!players.has(name)) {
      players.set(name, {
        name,
        points: 0,
        fastest: wins.fastest.get(name) ?? 0,
        efficient: wins.efficient.get(name) ?? 0,
        leanest: wins.leanest.get(name) ?? 0,
        firstTry: 0,
        noHints: 0,
        bonus: 0,
        total: 0,
      });
    }
    return players.get(name)!;
  };

  scores.forEach(score => {
    const player = forPlayer(score.player);
    player.points += pointsPerExercise.get(`${score.game}-${score.exerciseid}`) ?? 0;
    if (score.attempts <= 1) {
      player.firstTry++;
    }
    if (score.hintsused === 0) {
      player.noHints++;
    }
  });

  return [...players.values()]
    .map(player => {
      const bonus =
        player.fastest * scoringWeights.fastest +
        player.efficient * scoringWeights.efficient +
        player.leanest * scoringWeights.leanest +
        player.firstTry * scoringWeights.firstTry +
        player.noHints * scoringWeights.noHints;
      return {...player, bonus, total: player.points + bonus};
    })
    .sort((a, b) => b.total - a.total || b.points - a.points || a.name.localeCompare(b.name));
}
