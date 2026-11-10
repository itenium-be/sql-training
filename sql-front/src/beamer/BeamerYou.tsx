import { PlayerRow } from '../leaderboard/leaderboardData';
import { Player } from '../game';
import { Score } from '../exercises/exerciseModels';
import { YourStanding } from './YourStanding';
import { YourScores } from '../leaderboard/YourScores';

export function BeamerYou({rows, you, players, scores}: {rows: PlayerRow[]; you: string; players: Player[]; scores: Score[]}) {
  const mine = scores.filter(s => s.player === you);

  if (mine.length === 0) {
    return (
      <div className="bm-body bm-body-empty">
        <div className="bm-title" style={{opacity: 0.7}}>Solve an exercise to see your scores here…</div>
      </div>
    );
  }

  return (
    <div className="bm-body bm-you">
      <YourStanding rows={rows} you={you} players={players} />
      <h2 className="bm-you-head">Your Scores</h2>
      <YourScores scores={mine} />
    </div>
  );
}
