import { useState } from 'react';
import { Avatar } from '../Avatar';
import { avatarIndex } from '../game';
import { AiSuspect, exerciseCells, tellBadges } from './aiData';

const HEADERS = ['Exercise', 'Solve time', 'Chars/s', 'Unkeyed', 'Away', 'Cadence CV', 'Client'];

type AiTabProps = {
  suspects: AiSuspect[];
  onDisqualify: (name: string, disqualified: boolean) => void;
};

function SuspectRow({ s, onDisqualify }: { s: AiSuspect; onDisqualify: AiTabProps['onDisqualify'] }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={`adm-ai-row ${s.disqualified ? 'adm-dq' : ''}`}>
      <button type="button" className="adm-ai-hd" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Avatar index={avatarIndex({ id: s.id, name: s.player, avatar: s.avatar })} label={s.player} size={38} />
        <div className="adm-ai-main">
          <strong style={{ color: 'var(--df-cream)' }}>{s.disqualified ? <s>{s.player}</s> : s.player}</strong>
          <span className="adm-sub"> {s.correct}/{s.attempts} correct</span>
          <div className="adm-ai-tells">
            {tellBadges(s).map(b => <span key={b.label} className={`adm-ai-tell ${b.hard ? 'adm-ai-hard' : 'adm-ai-soft'}`}>{b.label}</span>)}
          </div>
        </div>
        <span className={`adm-ai-score ${s.score >= 50 ? 'adm-ai-high' : ''}`} aria-label={`score ${s.score}`}>{s.score}</span>
      </button>
      {open && (
        <div className="adm-ai-detail">
          <table className="adm-ai-table">
            <thead><tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {s.exercises.map(e => (
                <tr key={`${e.game}-${e.exerciseId}`}>{exerciseCells(e).map((c, i) => <td key={HEADERS[i]}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
          {s.disqualified
            ? <button type="button" className="adm-dq-btn" onClick={() => onDisqualify(s.player, false)}>Reinstate</button>
            : <button type="button" className="adm-dq-btn adm-dq-btn-red"
                onClick={() => window.confirm(`Disqualify ${s.player}?`) && onDisqualify(s.player, true)}>Disqualify…</button>}
        </div>
      )}
    </li>
  );
}

export function AiTab({ suspects, onDisqualify }: AiTabProps) {
  return (
    <div className="adm-wide">
      <div className="df-register" style={{ maxWidth: 'none' }}>
        {suspects.length
          ? <ul className="adm-ai-list">{suspects.map(s => <SuspectRow key={s.player} s={s} onDisqualify={onDisqualify} />)}</ul>
          : <p className="adm-sub adm-ai-empty">No AI players flagged.</p>}
        <div className="adm-sub adm-ai-foot">Listed on a hard tell only. Speed, time away and cadence only rank.</div>
      </div>
    </div>
  );
}
