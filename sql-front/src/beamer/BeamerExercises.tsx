import { useState } from 'react';
import { ExerciseId, ExerciseModel, Score } from '../exercises/exerciseModels';
import { ExerciseAward, exerciseAwards } from '../leaderboard/leaderboardData';
import { BoltIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { SolutionCard, SolutionTag, exerciseSolutions, formatClock, myExerciseResult } from './beamerData';

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

const TAG_LABEL: Record<SolutionTag, string> = {fastest: 'Fastest', shortest: 'Shortest', leanest: 'Leanest'};

function tagMetric(tag: SolutionTag, award: ExerciseAward): string {
  if (tag === 'fastest' && award.fastest) return formatClock(award.fastest.time);
  if (tag === 'shortest' && award.shortest) return `${award.shortest.chars} ch`;
  if (tag === 'leanest' && award.leanest) return `${award.leanest.reads} reads`;
  return '';
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
              <div className="bm-aw"><span className="bm-awname">#{award.exerciseId} · {award.desc}</span></div>
              <span className="bm-solvedby">{award.solvedBy}<small>/{totalPlayers}</small></span>
              <Holder name={award.fastest?.player} value={award.fastest ? formatClock(award.fastest.time) : ''} you={you} />
              <Holder name={award.shortest?.player} value={award.shortest ? `${award.shortest.chars} ch` : ''} you={you} />
              <Holder name={award.leanest?.player} value={award.leanest ? `${award.leanest.reads} reads` : ''} you={you} />
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
