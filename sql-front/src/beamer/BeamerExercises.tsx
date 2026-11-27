import { ReactNode, useEffect, useState } from 'react';
import { ExerciseId, ExerciseModel, Score } from '../exercises/exerciseModels';
import { awardLabel, exerciseAwards } from '../leaderboard/leaderboardData';
import { BoltIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { exerciseSolutions, formatClock, solutionsVisible } from './beamerData';
import { authFetch, config } from '../config';
import { useAppSelector } from '../store';
import { SolutionCard } from '../exercises/SolutionCard';
import { cardMetrics, PlayerSolution, playerMetrics, withSolutions } from '../exercises/solutionCards';

type Solutions = {
  key: string;
  reference: { solution: string; length: number; cost: number | null };
  solutions: PlayerSolution[];
};

function Holder({name, value, you, label}: {name: string | undefined; value: string; you: string; label: ReactNode}) {
  const caption = <span className="bm-aw-label">{label}</span>;
  if (!name) {
    return <div className="bm-aw">{caption}<span className="bm-dash">—</span></div>;
  }
  return (
    <div className={name === you ? 'bm-aw bm-mine' : 'bm-aw'}>
      {caption}
      <span className="bm-awname">{name}</span>
      <span className="bm-awval">{value}</span>
    </div>
  );
}

export function BeamerExercises({entities, scores, you, ended}: {entities: ExerciseModel[]; scores: Score[]; you: string; ended: boolean}) {
  const [game, setGame] = useState<ExerciseId>(entities[0]?.id ?? 'World');
  const [open, setOpen] = useState<number | null>(null);
  const awards = exerciseAwards(entities, scores, game);
  const totalPlayers = new Set(scores.map(s => s.player)).size;

  const switchGame = (id: ExerciseId) => { setGame(id); setOpen(null); };
  const gaveUp = useAppSelector(state => state.exercises.gaveUp);
  const visible = (exerciseId: number) => solutionsVisible({ended, scores, gaveUp, you, game, exerciseId});
  const withColumn = awards.some(a => visible(a.exerciseId));

  const [fetched, setFetched] = useState<Solutions | null>(null);
  const openKey = `${game}-${open}`;
  const data = fetched?.key === openKey ? fetched : null;

  // Refetched with the scores so the award holders stay live while the game runs.
  useEffect(() => {
    if (open === null) return;
    authFetch(`${config.api}/game/solutions?game=${encodeURIComponent(game)}&exerciseId=${open}`)
      .then(res => res.ok ? res.json() : null)
      .then(body => { if (body) setFetched({key: `${game}-${open}`, ...body}); })
      .catch(err => console.error('Could not fetch the solutions', err));
  }, [open, game, scores]);

  return (
    <div className="bm-body">
      <div className="bm-subhead">
        <h2>Exercise awards</h2>
        <div className="bm-games" role="group" aria-label="Game">
          {entities.map(g => (
            <button key={g.id} type="button" className="bm-game" aria-pressed={g.id === game} onClick={() => switchGame(g.id)}>{g.id}</button>
          ))}
        </div>
        <select className="bm-games-select" aria-label="Game" value={game} onChange={e => switchGame(e.target.value as ExerciseId)}>
          {entities.map(g => <option key={g.id} value={g.id}>{g.id}</option>)}
        </select>
      </div>

      <div className={withColumn ? 'bm-awards bm-awards-solutions' : 'bm-awards'}>
        <div className="bm-awrow bm-awrow-head">
          <span>Exercise</span><span>Solved by</span>
          <span><BoltIcon size={16} />Fastest</span>
          <span><CodeIcon size={16} />Shortest</span>
          <span><LeafIcon size={16} />Leanest</span>
          {withColumn && <span>Solutions</span>}
        </div>
        {awards.map(award => {
          const isOpen = open === award.exerciseId;
          const filled = data && isOpen ? withSolutions(scores, game, award.exerciseId, data.solutions) : scores;
          const cards = data && isOpen ? exerciseSolutions(filled, you, award) : [];
          return (
            <div key={award.exerciseId} className={isOpen ? 'bm-awrow bm-awrow-open' : 'bm-awrow'}>
              <div className="bm-aw"><span className="bm-awname">{awardLabel(award)}</span></div>
              <span className="bm-solvedby">{award.solvedBy}<small>/{totalPlayers}</small></span>
              <Holder name={award.fastest?.player} value={award.fastest ? formatClock(award.fastest.time) : ''} you={you} label={<><BoltIcon size={12} />Fastest</>} />
              <Holder name={award.shortest?.player} value={award.shortest ? `${award.shortest.chars} ch` : ''} you={you} label={<><CodeIcon size={12} />Shortest</>} />
              <Holder name={award.leanest?.player} value={award.leanest ? `${award.leanest.reads} reads` : ''} you={you} label={<><LeafIcon size={12} />Leanest</>} />
              {visible(award.exerciseId) ? (
                <button type="button" className="bm-sol-btn" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : award.exerciseId)}>
                  <span className="bm-sol-chev">▸</span> Solutions
                </button>
              ) : withColumn && <span />}
              {isOpen && data && (
                <div className="bm-sol-panel">
                  {award.desc && <p className="bm-sol-q">{award.desc}</p>}
                  <SolutionCard
                    label={<span className="df-soltag">Reference</span>}
                    metrics={cardMetrics({chars: data.reference.length, reads: data.reference.cost}, [])}
                    solution={data.reference.solution}
                  />
                  {cards.length
                    ? cards.map(card => (
                      <SolutionCard
                        key={card.player}
                        mine={card.isYou}
                        label={card.isYou ? <span className="df-soltag df-soltag-you">You</span> : <span className="df-solcard-who">{card.player}</span>}
                        metrics={playerMetrics(filled.find(s => s.player === card.player && s.game === game && s.exerciseid === award.exerciseId), card.tags)}
                        solution={card.solution}
                      />
                    ))
                    : <span className="bm-you-none">No solutions yet</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
