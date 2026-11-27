import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useLiveScores } from '../layout/useLiveScores';
import { SlidesIcon, TrophyIcon } from '../layout/Icons';
import { dashboardSummary } from './dashboardSummary';
import { GamePoster } from './GamePoster';
import './dashboard.css';

export function Dashboard() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const scores = useAppSelector(state => state.exercises.scores);
  const you = useAppSelector(state => state.exercises.userName);
  useLiveScores();

  const summary = dashboardSummary(exercises, scores, you);
  const standing = summary.rank === null ? 'Solve an exercise to get ranked'
    : summary.gapToNext === null ? 'You lead!'
    : `${summary.gapToNext} pts behind #${summary.rank - 1}`;

  return (
    <div className="db-dash">
      <div className="df-eyebrow">Your dashboard</div>
      <h1 className="db-title">Pick a playground</h1>


      <div className="db-posters">
        {summary.games.map(game => <GamePoster key={game.id} game={game} />)}
      </div>

      <div className="db-links">
        <Link to="/leaderboard" className="db-card db-link">
          <span className="db-ico"><TrophyIcon /></span>
          <span><h3>Leaderboard</h3><small>{standing}</small></span>
          <span className="db-go">→</span>
        </Link>
        <a href="/slides/" target="_blank" rel="noreferrer" className="db-card db-link">
          <span className="db-ico"><SlidesIcon /></span>
          <span><h3>Slides</h3><small>Rules &amp; prizes</small></span>
          <span className="db-go">↗</span>
        </a>
      </div>
    </div>
  );
}
