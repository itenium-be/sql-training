import { PlayerRow } from '../leaderboard/leaderboardData';
import { Player } from '../game';
import { BeamerAvatar } from './BeamerAvatar';

export function YourStanding({rows, you, players}: {rows: PlayerRow[]; you: string; players: Player[]}) {
  const youIndex = rows.findIndex(r => r.name === you);
  if (youIndex === -1) {
    return null;
  }
  const youRow = rows[youIndex];

  return (
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
  );
}
