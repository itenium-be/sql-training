import { useEffect, useState } from 'react';
import { authFetch, config } from '../config';
import { useAppSelector } from '../store';
import { ExerciseAward, exerciseAwards } from '../leaderboard/leaderboardData';
import { exerciseSolutions, SolutionCard, TAG_LABEL, tagMetric } from '../beamer/beamerData';
import { CopyButton } from '../layout/CopyButton';
import { ExerciseId } from './exerciseModels';
import { PlayerSolution, withSolutions } from './solutionCards';
import { MySolution } from './MySolution';

type SolutionsModel = { reference: string; solutions: PlayerSolution[] };

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
  const mine = cards.find(c => c.isYou);

  return (
    <div className="df-solutions">
      {solved && (
        <MySolution game={game} exerciseId={exerciseId} points={points} maxPoints={maxPoints}
          tags={award && mine ? <Tags card={mine} award={award} /> : null} />
      )}
      {data && (
        <section className="df-solcard">
          <div className="df-solcard-head">
            <span className="df-soltag">Reference</span>
            <CopyButton text={data.reference} />
          </div>
          <pre className="df-sample-query">{data.reference}</pre>
        </section>
      )}
      {award && cards.filter(c => !c.isYou).map(card => (
        <section key={card.player} className="df-solcard">
          <div className="df-solcard-head">
            <Tags card={card} award={award} />
            <span className="df-solcard-who">{card.player}</span>
            <CopyButton text={card.solution} />
          </div>
          <pre className="df-sample-query">{card.solution}</pre>
        </section>
      ))}
    </div>
  );
}

function Tags({card, award}: {card: SolutionCard, award: ExerciseAward}) {
  return card.tags.map(tag => (
    <span key={tag} className={`df-soltag df-soltag-${tag}`}>
      {TAG_LABEL[tag]} · {tagMetric(tag, award)}
    </span>
  ));
}
