import { useEffect, useState } from 'react';
import { authFetch, config } from '../config';
import { useAppSelector } from '../store';
import { exerciseAwards } from '../leaderboard/leaderboardData';
import { exerciseSolutions } from '../beamer/beamerData';
import { ExerciseId } from './exerciseModels';
import { cardMetrics, PlayerSolution, playerMetrics, withSolutions } from './solutionCards';
import { MySolution } from './MySolution';
import { SolutionCard } from './SolutionCard';

type SolutionsModel = {
  reference: { solution: string; length: number; cost: number | null };
  solutions: PlayerSolution[];
};

export function SolutionsPanel({game, exerciseId, solved, points, maxPoints}: {game: string, exerciseId: number, solved: boolean, points: number, maxPoints: number}) {
  const entities = useAppSelector(state => state.exercises.entities);
  const scores = useAppSelector(state => state.exercises.scores);
  const you = useAppSelector(state => state.exercises.userName);
  const [data, setData] = useState<SolutionsModel | null>(null);

  // Refetched with the scores so the award holders stay live while the game runs.
  useEffect(() => {
    authFetch(`${config.api}/game/solutions?game=${encodeURIComponent(game)}&exerciseId=${exerciseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(setData)
      .catch(err => console.error('Could not fetch the solutions', err));
  }, [game, exerciseId, scores]);

  const filled = data ? withSolutions(scores, game, exerciseId, data.solutions) : scores;
  const award = exerciseAwards(entities, filled, game as ExerciseId).find(a => a.exerciseId === exerciseId);
  const cards = data && award ? exerciseSolutions(filled, you, award) : [];
  const scoreOf = (player: string) => filled.find(s => s.player === player && s.game === game && s.exerciseid === exerciseId);
  const myTags = cards.find(c => c.isYou)?.tags ?? [];

  return (
    <div className="df-solutions">
      {solved && (
        <MySolution game={game} exerciseId={exerciseId} points={points} maxPoints={maxPoints}
          metrics={playerMetrics(scoreOf(you), myTags)} />
      )}
      {data && (
        <SolutionCard
          label={<span className="df-soltag">Reference</span>}
          metrics={cardMetrics({chars: data.reference.length, reads: data.reference.cost}, [])}
          solution={data.reference.solution}
        />
      )}
      {cards.filter(c => !c.isYou).map(card => (
        <SolutionCard
          key={card.player}
          label={<span className="df-solcard-who">{card.player}</span>}
          metrics={playerMetrics(scoreOf(card.player), card.tags)}
          solution={card.solution}
        />
      ))}
    </div>
  );
}
