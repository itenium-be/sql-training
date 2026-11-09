import { useState } from 'react';
import { ExerciseId, ExerciseModel, Score } from '../exercises/exerciseModels';
import { exerciseAwards } from '../leaderboard/leaderboardData';
import { BoltIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { formatClock, myExerciseResult } from './beamerData';

function Holder({name, value, you}: {name: string | undefined; value: string; you: string}) {
  if (!name) {
    return <div className="bm-aw"><span className="bm-dash">—</span></div>;
  }
  return (
    <div className={name === you ? 'bm-aw bm-mine' : 'bm-aw'}>
      <span className="bm-awname">{name}</span>
      <span className="bm-awval">{value}</span>
    </div>
  );
}

export function BeamerExercises({entities, scores, you}: {entities: ExerciseModel[]; scores: Score[]; you: string}) {
  const [game, setGame] = useState<ExerciseId>(entities[0]?.id ?? 'World');
  const awards = exerciseAwards(entities, scores, game);
  const totalPlayers = new Set(scores.map(s => s.player)).size;

  return (
    <div className="bm-body">
      <div className="bm-subhead">
        <h2>Exercise awards</h2>
        <span className="bm-subhead-note">your awards in gold</span>
        <div className="bm-games">
          {entities.map(g => (
            <button key={g.id} type="button" className="bm-game" aria-pressed={g.id === game} onClick={() => setGame(g.id)}>{g.id}</button>
          ))}
        </div>
      </div>

      <div className="bm-awards">
        <div className="bm-awrow bm-awrow-head">
          <span>Exercise</span><span>Solved by</span>
          <span><BoltIcon size={16} />Fastest</span>
          <span><CodeIcon size={16} />Shortest</span>
          <span><LeafIcon size={16} />Leanest</span>
          <span>You</span>
        </div>
        {awards.map(award => {
          const mine = myExerciseResult(scores, you, game, award.exerciseId);
          const holdsAward = !!you && (award.fastest?.player === you || award.shortest?.player === you || award.leanest?.player === you);
          return (
            <div key={award.exerciseId} className="bm-awrow">
              <div className="bm-aw"><span className="bm-awname">#{award.exerciseId} · {award.desc}</span></div>
              <span className="bm-solvedby">{award.solvedBy}<small>/{totalPlayers}</small></span>
              <Holder name={award.fastest?.player} value={award.fastest ? formatClock(award.fastest.time) : ''} you={you} />
              <Holder name={award.shortest?.player} value={award.shortest ? `${award.shortest.chars} ch` : ''} you={you} />
              <Holder name={award.leanest?.player} value={award.leanest ? `${award.leanest.reads} reads` : ''} you={you} />
              <div className="bm-aw">
                {mine
                  ? <span className={holdsAward ? 'bm-you-cell bm-you-award' : 'bm-you-cell'}>{formatClock(mine.elapsed)} · {mine.chars} ch</span>
                  : <span className="bm-you-none">not solved</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
