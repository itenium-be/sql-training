import { Badge } from 'react-bootstrap';
import { Avatar } from '../Avatar';
import { avatarIndex } from '../game';
import { ExerciseModel } from '../exercises/exerciseModels';
import { formatClock } from '../beamer/beamerData';
import { rankPlayers } from '../leaderboard/leaderboardData';
import { activityLevel, AdminOverview, IDLE_SEC, stuckRows, StuckRow } from './adminData';

function ActivityDot({ seconds }: { seconds: number | null }) {
  const level = activityLevel(seconds);
  const cls = level === 'active' ? 'adm-active' : level === 'recent' ? 'adm-recent' : 'adm-idle';
  const label = seconds === null ? 'never typed'
    : level === 'idle' ? `idle ${formatClock(seconds)}`
    : level === 'active' ? `typing ${seconds}s ago`
    : `typed ${formatClock(seconds)} ago`;
  return <span className={level === 'idle' ? 'adm-sub' : undefined}><span className={`adm-adot ${cls}`} />{label}</span>;
}

function StuckTable({ rows }: { rows: StuckRow[] }) {
  return (
    <table className="adm-stuck-tbl">
      <thead>
        <tr><th>Stuck on</th><th>Running</th><th>Wrong</th><th>Last typing</th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={`${r.game}-${r.exerciseid}`}>
            <td><span className="adm-exn">#{r.exerciseid}</span> <span className="adm-sub">{r.desc}</span></td>
            <td className="adm-mono">{formatClock(r.runningSec)}</td>
            <td>{r.wrong
              ? <><span className="adm-wrong">✗{r.wrong}</span> {r.lastWrongSec !== null && <span className="adm-sub adm-mono">{formatClock(r.lastWrongSec)} ago</span>}</>
              : <span className="adm-sub">—</span>}</td>
            <td style={{ fontSize: '.78rem' }}><ActivityDot seconds={r.lastActiveSec} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PlayersTab({ overview, entities, now }: { overview: AdminOverview; entities: ExerciseModel[]; now: number }) {
  const ranked = new Map(rankPlayers(entities, overview.progress).map(r => [r.name, r]));
  const total = entities.reduce((n, g) => n + g.exercises.length, 0);

  const cards = overview.players.map(p => {
    const row = ranked.get(p.name);
    const solved = row?.solved ?? 0;
    const points = row?.points ?? 0;
    const hints = overview.progress.filter(s => s.player === p.name && s.hint).length;
    const stuck = stuckRows(p.name, overview, now);
    const started = stuck.length > 0 || solved > 0;
    const anyActive = stuck.some(r => r.lastActiveSec !== null && r.lastActiveSec < IDLE_SEC);
    return { p, solved, points, hints, stuck, started, anyActive };
  }).sort((a, b) => b.stuck.length - a.stuck.length || b.points - a.points);

  return (
    <div className="adm-players">
      {cards.map(({ p, solved, points, hints, stuck, started, anyActive }) => {
        const gone = !started || !anyActive;
        const badge = !started
          ? <Badge bg="danger">never active</Badge>
          : anyActive ? <Badge bg="warning" text="dark">live</Badge> : <Badge bg="secondary">idle</Badge>;
        return (
          <div key={p.id} className={`df-register adm-pcard ${stuck.length && !anyActive ? 'adm-stuck' : ''} ${gone ? 'adm-gone' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar index={avatarIndex(p)} label={p.name} size={38} />
              <div>
                <strong style={{ color: 'var(--df-cream)' }}>{p.name}</strong>
                <div className="adm-sub">{points} pts · {solved}/{total} · {hints} hints</div>
              </div>
              <span style={{ marginLeft: 'auto' }}>{badge}</span>
            </div>
            <div className="adm-dots">
              {Array.from({ length: total }, (_, i) => <span key={i} className={`adm-d ${i < solved ? 'adm-done' : ''}`} />)}
            </div>
            {!started
              ? <div className="adm-sub" style={{ marginTop: 9 }}>registered, no submission</div>
              : stuck.length
                ? <StuckTable rows={stuck} />
                : <div className="adm-sub" style={{ marginTop: 9 }}>🏁 finished all {total}</div>}
          </div>
        );
      })}
    </div>
  );
}
