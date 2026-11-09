import { ReactNode } from 'react';
import { PlayerRow } from '../leaderboard/leaderboardData';
import { BoltIcon, CheckIcon, CodeIcon, LeafIcon } from '../layout/Icons';

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function Badges({row}: {row: PlayerRow}) {
  const badge = (value: number, icon: ReactNode) => (
    <span className={value ? 'bm-ib' : 'bm-ib bm-ib0'}>{icon}{value}</span>
  );
  return (
    <div className="bm-podbadges">
      {badge(row.solved, <CheckIcon size={15} />)}
      {badge(row.fastest, <BoltIcon size={15} />)}
      {badge(row.shortest, <CodeIcon size={15} />)}
      {badge(row.leanest, <LeafIcon size={15} />)}
    </div>
  );
}

function CrownIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" />
    </svg>
  );
}

function Spot({row, place}: {row: PlayerRow | undefined; place: 1 | 2 | 3}) {
  return (
    <div className={`bm-pod bm-pod-${place}`}>
      {place === 1 && <span className="bm-pod-crown"><CrownIcon /></span>}
      {row ? (
        <>
          <span className="bm-av bm-pod-av" style={place === 1 ? {width: 116, height: 116, fontSize: 46, borderColor: 'var(--df-gold)', boxShadow: '0 0 0 6px rgba(233,180,76,0.2), 0 0 60px rgba(233,180,76,0.25)'} : {width: 92, height: 92, fontSize: 36}}>
            {initial(row.name)}
          </span>
          <div className="bm-pod-name">{row.name}</div>
          <div className="bm-plinth">
            <div className="bm-plinth-rank">{place}</div>
            <div className="bm-plinth-pts">{row.total} pts</div>
            <Badges row={row} />
          </div>
        </>
      ) : <div className="bm-plinth" />}
    </div>
  );
}

function Metric({value}: {value: number}) {
  return <span className={value ? 'bm-m' : 'bm-m0'}>{value}</span>;
}

export function BeamerPlayers({rows, you}: {rows: PlayerRow[]; you: string}) {
  const [first, second, third] = rows;
  const board = rows.slice(3);
  const youIndex = rows.findIndex(r => r.name === you);
  const youRow = youIndex === -1 ? null : rows[youIndex];

  return (
    <div className="bm-body">
      <div className="bm-podium">
        <Spot row={second} place={2} />
        <Spot row={first} place={1} />
        <Spot row={third} place={3} />
      </div>

      <div className="bm-board">
        <div className="bm-row bm-row-head">
          <span>#</span><span></span><span>Player</span><span>Solved</span>
          <span style={{textAlign: 'center'}}>Fastest</span><span style={{textAlign: 'center'}}>Shortest</span>
          <span style={{textAlign: 'center'}}>Leanest</span><span style={{textAlign: 'right'}}>Total</span>
        </div>
        {board.map((row, index) => (
          <div key={row.name} className={row.name === you ? 'bm-row bm-row-me' : 'bm-row'}>
            <span className="bm-rank">{index + 4}</span>
            <span className="bm-av" style={{width: 44, height: 44, fontSize: 18, ...(row.name === you ? {borderColor: 'var(--df-gold)'} : {})}}>{initial(row.name)}</span>
            <span className="bm-name">{row.name}{row.name === you && <span className="bm-you"> you</span>}</span>
            <span className="bm-solved">
              <span className="bm-bar"><span style={{width: `${row.totalExercises ? Math.round(row.solved / row.totalExercises * 100) : 0}%`}} /></span>
              <span className="bm-ratio">{row.solved}/{row.totalExercises}</span>
            </span>
            <Metric value={row.fastest} />
            <Metric value={row.shortest} />
            <Metric value={row.leanest} />
            <span className="bm-total">{row.total}</span>
          </div>
        ))}
      </div>

      {youRow && (
        <div className="bm-standing">
          <span className="bm-av" style={{width: 80, height: 80, fontSize: 32, borderColor: 'var(--df-gold)', boxShadow: '0 0 0 5px rgba(233,180,76,0.2)'}}>{initial(youRow.name)}</span>
          <div style={{flex: 'none'}}>
            <div className="bm-standing-sub">Your standing</div>
            <div className="bm-standing-rank">#{youIndex + 1} of {rows.length} · {youRow.total} pts</div>
          </div>
          <div className="bm-pills">
            <span className="bm-pill bm-pill-correct"><b>{youRow.solved}</b> correct</span>
            {youRow.fastest > 0 && <span className="bm-pill"><b>{youRow.fastest}</b> fastest</span>}
            {youRow.shortest > 0 && <span className="bm-pill"><b>{youRow.shortest}</b> shortest</span>}
            {youRow.leanest > 0 && <span className="bm-pill"><b>{youRow.leanest}</b> leanest</span>}
          </div>
        </div>
      )}
    </div>
  );
}
