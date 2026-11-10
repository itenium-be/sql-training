import { Avatar } from '../Avatar';
import { avatarIndex } from '../game';
import { ExerciseModel } from '../exercises/exerciseModels';
import { rankPlayers } from '../leaderboard/leaderboardData';
import { activityLevel, AdminOverview, humanDuration, IDLE_SEC, stuckRows, StuckRow } from './adminData';

function TypedAgo({ seconds }: { seconds: number | null }) {
  const level = activityLevel(seconds);
  const cls = level === 'active' ? 'adm-active' : level === 'recent' ? 'adm-recent' : 'adm-idle';
  return <span className="adm-qtyped" title="last keystroke"><span className={`adm-adot ${cls}`} />{humanDuration(seconds)}</span>;
}

function QuestionBox({ row }: { row: StuckRow }) {
  return (
    <div className={`adm-qbox ${row.wrong ? 'adm-qwrong' : ''}`}>
      <div className="adm-qhd">
        <span className="adm-exn">{row.game}#{row.exerciseid}</span>
        <span className="adm-qlbl" title={row.desc}>{row.desc}</span>
        <span className="adm-qt" title="time on this question">⏱ {humanDuration(row.runningSec)}</span>
      </div>
      <div className="adm-qstats">
        <TypedAgo seconds={row.lastActiveSec} />
        {row.wrong > 0 && <span className="adm-qwr">✗{row.wrong}</span>}
        {row.hint && <span className="adm-qhint">💡 hint</span>}
        {row.expected && <span className="adm-qresult">📊 result set</span>}
      </div>
    </div>
  );
}

export function PlayersTab({ overview, entities, now }: { overview: AdminOverview; entities: ExerciseModel[]; now: number }) {
  const ranked = new Map(rankPlayers(entities, overview.progress).map(r => [r.name, r]));
  const total = entities.reduce((n, g) => n + g.exercises.length, 0);

  const cards = overview.players.map(p => {
    const row = ranked.get(p.name);
    const solved = row?.solved ?? 0;
    const points = row?.points ?? 0;
    const stuck = stuckRows(p.name, overview, now);
    const started = stuck.length > 0 || solved > 0;
    const anyActive = stuck.some(r => r.lastActiveSec !== null && r.lastActiveSec < IDLE_SEC);
    return { p, solved, points, stuck, started, anyActive };
  }).sort((a, b) => b.stuck.length - a.stuck.length || b.points - a.points);

  return (
    <div className="adm-players">
      {cards.map(({ p, solved, points, stuck, started, anyActive }) => {
        const sub = !started ? 'registered'
          : stuck.length ? `${points} pts · ${stuck.length} open`
          : `${points} pts`;
        return (
          <div key={p.id} className={`df-register adm-pcard ${stuck.length && !anyActive ? 'adm-stuck' : ''} ${!started || !anyActive ? 'adm-gone' : ''}`}>
            <div className="adm-pc-hd">
              <Avatar index={avatarIndex(p)} label={p.name} size={38} />
              <div>
                <strong style={{ color: 'var(--df-cream)' }}>{p.name}</strong>
                <div className="adm-sub">{sub}</div>
              </div>
              <span className="adm-frac">{solved}/{total}</span>
            </div>
            <div className="adm-pbar"><i style={{ width: `${total ? (solved / total) * 100 : 0}%` }} /></div>
            {!started
              ? <div className="adm-sub" style={{ marginTop: 9 }}>no submission yet</div>
              : stuck.length
                ? stuck.map(r => <QuestionBox key={`${r.game}-${r.exerciseid}`} row={r} />)
                : solved >= total
                  ? <div className="adm-fin">🏁 finished all {total}</div>
                  : <div className="adm-sub" style={{ marginTop: 9 }}>nothing open right now</div>}
          </div>
        );
      })}
    </div>
  );
}
