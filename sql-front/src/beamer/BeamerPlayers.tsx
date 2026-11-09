import { CSSProperties, ReactNode } from 'react';
import { PlayerRow } from '../leaderboard/leaderboardData';
import { BoltIcon, CheckIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { Player, avatarIndex } from '../game';
import { avatarUrl } from '../avatars';

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

type Ring = 'gold' | 'you' | 'border';

const ringStyle: Record<Ring, CSSProperties> = {
  gold: {borderColor: 'var(--df-gold)', boxShadow: '0 0 0 6px rgba(233,180,76,0.2), 0 0 60px rgba(233,180,76,0.25)'},
  you: {borderColor: 'var(--df-gold)', boxShadow: '0 0 0 5px rgba(233,180,76,0.2)'},
  border: {borderColor: 'var(--df-gold)'},
};

function BeamerAvatar({name, players, size, ring}: {name: string; players: Player[]; size: number; ring?: Ring}) {
  const player = players.find(p => p.name.toLowerCase() === name.toLowerCase());
  const style = {width: size, height: size, fontSize: Math.round(size * 0.4), ...(ring ? ringStyle[ring] : {})};
  return (
    <span className="bm-av" style={style}>
      {player ? <img className="bm-av-photo" src={avatarUrl(avatarIndex(player))} alt={name} /> : initial(name)}
    </span>
  );
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

export function BeamerPlayers({rows, you, players, showStanding}: {rows: PlayerRow[]; you: string; players: Player[]; showStanding: boolean}) {
  const [first, second, third] = rows;
  const board = rows.slice(3);
  const youIndex = rows.findIndex(r => r.name === you);
  const youRow = youIndex === -1 ? null : rows[youIndex];

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

      {showStanding && youRow && (
        <div className="bm-standing">
          <BeamerAvatar name={youRow.name} players={players} size={80} ring="you" />
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
