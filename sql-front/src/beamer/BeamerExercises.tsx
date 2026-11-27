import { ReactNode, useState } from 'react';
import { ExerciseId, ExerciseModel, Score } from '../exercises/exerciseModels';
import { awardLabel, ExerciseAward, exerciseAwards } from '../leaderboard/leaderboardData';
import { BoltIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { SolutionCard, TAG_LABEL, exerciseSolutions, formatClock, myExerciseResult, tagMetric } from './beamerData';

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

function SolutionCardView({card, award, scores, you}: {card: SolutionCard; award: ExerciseAward; scores: Score[]; you: string}) {
  const label = card.tags.map(t => TAG_LABEL[t]).join(' · ');
  const youLabel = card.isYou ? (label ? `${label} · You` : 'You') : label;
  const mine = card.isYou ? myExerciseResult(scores, you, award.game, award.exerciseId) : null;
  const metric = card.tags.length
    ? card.tags.map(t => tagMetric(t, award)).join(' · ')
    : mine ? `${formatClock(mine.elapsed)} · ${mine.chars} ch` : '';

  return (
    <div className={card.isYou ? 'bm-sol-card bm-sol-mine' : 'bm-sol-card'}>
      <div className="bm-sol-head">
        <span className="bm-sol-tag">{youLabel}</span>
        <span className="bm-sol-who">{!card.isYou && <b>{card.player}</b>}{metric && <span className="bm-sol-metric">{metric}</span>}</span>
      </div>
      <pre>{card.solution || '—'}</pre>
    </div>
  );
}

export function BeamerExercises({entities, scores, you, ended}: {entities: ExerciseModel[]; scores: Score[]; you: string; ended: boolean}) {
  const [game, setGame] = useState<ExerciseId>(entities[0]?.id ?? 'World');
  const [open, setOpen] = useState<number | null>(null);
  const awards = exerciseAwards(entities, scores, game);
  const totalPlayers = new Set(scores.map(s => s.player)).size;

  const switchGame = (id: ExerciseId) => { setGame(id); setOpen(null); };

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

      <div className={ended ? 'bm-awards bm-awards-ended' : 'bm-awards'}>
        <div className="bm-awrow bm-awrow-head">
          <span>Exercise</span><span>Solved by</span>
          <span><BoltIcon size={16} />Fastest</span>
          <span><CodeIcon size={16} />Shortest</span>
          <span><LeafIcon size={16} />Leanest</span>
          {ended && <span>Solutions</span>}
        </div>
        {awards.map(award => {
          const isOpen = open === award.exerciseId;
          const cards = ended && isOpen ? exerciseSolutions(scores, you, award) : [];
          return (
            <div key={award.exerciseId} className={isOpen ? 'bm-awrow bm-awrow-open' : 'bm-awrow'}>
              <div className="bm-aw"><span className="bm-awname">{awardLabel(award)}</span></div>
              <span className="bm-solvedby">{award.solvedBy}<small>/{totalPlayers}</small></span>
              <Holder name={award.fastest?.player} value={award.fastest ? formatClock(award.fastest.time) : ''} you={you} label={<><BoltIcon size={12} />Fastest</>} />
              <Holder name={award.shortest?.player} value={award.shortest ? `${award.shortest.chars} ch` : ''} you={you} label={<><CodeIcon size={12} />Shortest</>} />
              <Holder name={award.leanest?.player} value={award.leanest ? `${award.leanest.reads} reads` : ''} you={you} label={<><LeafIcon size={12} />Leanest</>} />
              {ended && (
                <button type="button" className="bm-sol-btn" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : award.exerciseId)}>
                  <span className="bm-sol-chev">▸</span> Solutions
                </button>
              )}
              {ended && isOpen && (
                <div className="bm-sol-panel">
                  {cards.length
                    ? cards.map(card => <SolutionCardView key={card.player} card={card} award={award} scores={scores} you={you} />)
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
