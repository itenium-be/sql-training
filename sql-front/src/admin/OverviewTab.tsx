import { Badge } from 'react-bootstrap';
import { Avatar } from '../Avatar';
import { avatarIndex, Player } from '../game';
import { ExerciseModel } from '../exercises/exerciseModels';
import { rankPlayers } from '../leaderboard/leaderboardData';
import { AdminOverview, PlayerInfo } from './adminData';
import { overviewStats } from './adminStats';

const key = (game: string, exerciseId: number) => `${game}-${exerciseId}`;

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="df-register">
      <div className="adm-statlabel">{label}</div>
      <div className="adm-bignum">{value}</div>
      {note && <div className="adm-sub">{note}</div>}
    </div>
  );
}

function exerciseSolveRates(overview: AdminOverview, entities: ExerciseModel[]) {
  const started = new Map<string, Set<string>>();
  overview.starts.forEach(s => {
    const k = key(s.game, s.exerciseid);
    (started.get(k) ?? started.set(k, new Set()).get(k)!).add(s.player);
  });
  const solved = new Map<string, number>();
  overview.progress.forEach(p => solved.set(key(p.game, p.exerciseid), (solved.get(key(p.game, p.exerciseid)) ?? 0) + 1));

  return entities.flatMap(g => g.exercises.map(ex => {
    const k = key(g.id, ex.id);
    const attempted = started.get(k)?.size ?? 0;
    const done = solved.get(k) ?? 0;
    return { id: ex.id, desc: ex.desc, done, attempted, rate: attempted ? done / attempted : 1 };
  }));
}

export function OverviewTab({ overview, entities, now }: { overview: AdminOverview; entities: ExerciseModel[]; now: number }) {
  const total = entities.reduce((n, g) => n + g.exercises.length, 0);
  const stats = overviewStats(overview, now, total);
  const info = new Map<string, PlayerInfo>(overview.players.map(p => [p.name, p]));
  const asPlayer = (name: string): Player => info.get(name) ?? { id: 0, name, avatar: null };

  if (overview.mode === 'init') {
    return (
      <>
        <div className="adm-banner"><Badge bg="warning" text="dark">LOBBY</Badge>
          <div><strong style={{ color: 'var(--df-cream)' }}>Players are registering.</strong> <span className="adm-sub">Hit Running when the room is ready.</span></div></div>
        <div className="adm-grid3" style={{ marginBottom: 14 }}>
          <Stat label="Registered" value={stats.registered} />
          <Stat label="Avatar chosen" value={<>{stats.avatarsChosen}<span className="adm-sub"> / {stats.registered}</span></>} />
          <Stat label="Exercises loaded" value={total} note={entities.map(e => e.name).join(' · ')} />
        </div>
        <div className="df-register">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Who's here</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {overview.players.map(p => (
              <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Avatar index={avatarIndex(p)} label={p.name} size={26} />{p.name}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (overview.mode === 'end') {
    const ranked = rankPlayers(entities, overview.progress);
    const rates = exerciseSolveRates(overview, entities).filter(r => r.attempted).sort((a, b) => a.rate - b.rate);
    const hardest = rates[0];
    const correct = overview.submissions.filter(s => s.correct).length;
    const pct = overview.submissions.length ? Math.round((correct / overview.submissions.length) * 100) : 0;
    return (
      <>
        <div className="adm-banner"><Badge bg="secondary">ENDED</Badge>
          <div><strong style={{ color: 'var(--df-cream)' }}>Game over.</strong> <span className="adm-sub">Solutions are on the Exercises tab.</span></div></div>
        <div className="adm-grid3" style={{ marginBottom: 14 }}>
          <Stat label="🥇 Winner" value={ranked[0]?.name ?? '—'} note={ranked[0] && `${ranked[0].total} pts · ${ranked[0].solved}/${total}`} />
          <Stat label="Hardest exercise" value={hardest ? `#${hardest.id}` : '—'} note={hardest && `${hardest.desc} · ${hardest.done}/${hardest.attempted} solved`} />
          <Stat label="Total submissions" value={overview.submissions.length} note={`${pct}% correct`} />
        </div>
        <div className="df-register">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Podium</h3>
          {ranked.slice(0, 3).map((r, i) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
              <span style={{ width: 28 }}>{['🥇', '🥈', '🥉'][i]}</span>
              <Avatar index={avatarIndex(asPlayer(r.name))} label={r.name} size={32} />
              <strong style={{ color: 'var(--df-cream)' }}>{r.name}</strong>
              <span className="adm-awval" style={{ marginLeft: 'auto' }}>{r.total}</span>
              <span className="adm-sub">{r.solved}/{total}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // running
  const stuck = exerciseSolveRates(overview, entities).filter(r => r.attempted).sort((a, b) => a.rate - b.rate).slice(0, 6);
  const feed = [...overview.submissions].slice(-8).reverse();
  return (
    <>
      <div className="adm-banner"><Badge bg="warning" text="dark">LIVE</Badge>
        <div><strong style={{ color: 'var(--df-cream)' }}>Game running.</strong> <span className="adm-sub">The live pulse of the room.</span></div></div>
      <div className="adm-grid3" style={{ marginBottom: 14 }}>
        <Stat label="Active now" value={<>{stats.activeNow}<span className="adm-sub"> / {stats.registered}</span></>} note={`${stats.idle} idle`} />
        <Stat label="Submissions / min" value={stats.submissionsPerMin} />
        <Stat label="Fully solved" value={<>{stats.fullySolved}<span className="adm-sub"> / {stats.registered}</span></>} note={`all ${total} exercises`} />
      </div>
      <div className="adm-grid2">
        <div className="df-register">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Where the room is stuck</h3>
          <table style={{ width: '100%' }}>
            <tbody>
              {stuck.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: '6px 4px' }}>#{r.id} · {r.desc}</td>
                  <td className="adm-sub adm-mono" style={{ padding: '6px 4px', textAlign: 'right' }}>{r.done}/{r.attempted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="df-register">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Live activity</h3>
          {feed.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: '.88rem' }}>
              <Avatar index={avatarIndex(asPlayer(s.player))} label={s.player} size={24} />
              <strong style={{ color: 'var(--df-cream)' }}>{s.player}</strong>
              <span className="adm-sub">{s.correct ? 'solved' : 'wrong on'} #{s.exerciseid}</span>
              {s.correct
                ? <Badge bg="warning" text="dark" style={{ marginLeft: 'auto' }}>✓</Badge>
                : <Badge bg="danger" style={{ marginLeft: 'auto' }}>✗</Badge>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
