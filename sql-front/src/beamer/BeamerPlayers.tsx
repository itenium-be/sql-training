import { ReactNode } from 'react';
import { PlayerRow } from '../leaderboard/leaderboardData';
import { BoltIcon, CheckIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { Player } from '../game';
import { BeamerAvatar } from './BeamerAvatar';

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

function Spot({row, place, players}: {row: PlayerRow | undefined; place: 1 | 2 | 3; players: Player[]}) {
  return (
    <div className={`bm-pod bm-pod-${place}`}>
      {place === 1 && <span className="bm-pod-crown"><CrownIcon /></span>}
      {row ? (
        <>
          <BeamerAvatar name={row.name} players={players} size={place === 1 ? 116 : 92} ring={place === 1 ? 'gold' : undefined} />
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

export function BeamerPlayers({rows, you, players}: {rows: PlayerRow[]; you: string; players: Player[]}) {
  const [first, second, third] = rows;
  const board = rows.slice(3);

  return (
    <div className="bm-body">
      <div className="bm-podium">
        <Spot row={second} place={2} players={players} />
        <Spot row={first} place={1} players={players} />
        <Spot row={third} place={3} players={players} />
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
            <BeamerAvatar name={row.name} players={players} size={44} ring={row.name === you ? 'border' : undefined} />
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
    </div>
  );
}
