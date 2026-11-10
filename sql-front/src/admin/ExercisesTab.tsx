import { useState } from 'react';
import { ExerciseModel } from '../exercises/exerciseModels';
import { formatClock } from '../beamer/beamerData';
import { exerciseAwards, ExerciseAward } from '../leaderboard/leaderboardData';
import { AdminOverview } from './adminData';
import { winningSolutions } from './adminStats';

function Holder({ player, value }: { player: string | undefined; value: string }) {
  if (!player) return <span className="adm-dash">—</span>;
  return <div><div className="adm-awname" style={{ fontWeight: 600 }}>{player}</div><div className="adm-awval">{value}</div></div>;
}

function AwardRow({ award, overview }: { award: ExerciseAward; overview: AdminOverview }) {
  const [open, setOpen] = useState(false);
  const ref = overview.solutions.find(s => s.game === award.game && s.exerciseId === award.exerciseId);
  const wins = winningSolutions(award, overview.progress);
  const metric = (tag: string) => tag === 'Fastest' ? formatClock(award.fastest!.time)
    : tag === 'Shortest' ? `${award.shortest!.chars} ch` : `${award.leanest!.reads} reads`;

  return (
    <>
      <div className="adm-awrow" onClick={() => setOpen(o => !o)}>
        <div className="adm-awname">#{award.exerciseId} · {award.desc}</div>
        <span className="adm-sub">{award.solvedBy}<small>/{overview.players.length}</small></span>
        <Holder player={award.fastest?.player} value={award.fastest ? formatClock(award.fastest.time) : ''} />
        <span className="adm-hidesm"><Holder player={award.shortest?.player} value={award.shortest ? `${award.shortest.chars} ch` : ''} /></span>
        <span className="adm-hidesm"><Holder player={award.leanest?.player} value={award.leanest ? `${award.leanest.reads} reads` : ''} /></span>
        <span className={`adm-chev ${open ? 'adm-open' : ''}`}>▸</span>
      </div>
      {open && (
        <div className="adm-sols">
          <div className="adm-sol adm-ref">
            <div className="adm-sol-head"><span className="adm-sol-tag" style={{ color: 'var(--df-cream)' }}>★ Reference solution</span>{ref && <span className="adm-sub">{ref.points} pts</span>}</div>
            <pre>{ref?.solution ?? '—'}</pre>
          </div>
          {wins.length
            ? <div className="adm-grid3">{wins.map(w => (
                <div key={w.tag} className="adm-sol">
                  <div className="adm-sol-head"><span className="adm-sol-tag">{w.tag}</span><span><b>{w.player}</b><span className="adm-sol-metric">{metric(w.tag)}</span></span></div>
                  <pre>{w.solution || '—'}</pre>
                </div>
              ))}</div>
            : <div className="adm-sub">No solves yet.</div>}
        </div>
      )}
    </>
  );
}

export function ExercisesTab({ overview, entities }: { overview: AdminOverview; entities: ExerciseModel[] }) {
  const games = entities.filter(g => g.exercises.length);
  return (
    <>
      {games.map(g => {
        const awards = exerciseAwards(entities, overview.progress, g.id);
        return (
          <div key={g.id} style={{ marginBottom: 20 }}>
            {games.length > 1 && <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{g.name}</h3>}
            <div className="df-register" style={{ padding: '0 14px' }}>
              <div className="adm-awrow adm-head">
                <span>Exercise</span><span>Solved</span><span>⚡ Fastest</span>
                <span className="adm-hidesm">&lt;/&gt; Shortest</span><span className="adm-hidesm">🍃 Leanest</span><span />
              </div>
              {awards.map(a => <AwardRow key={a.exerciseId} award={a} overview={overview} />)}
            </div>
          </div>
        );
      })}
    </>
  );
}
