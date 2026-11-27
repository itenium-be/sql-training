import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchData } from '../layout/fetchData';
import { useLiveScores } from '../layout/useLiveScores';
import { SlidesIcon, TrophyIcon } from '../layout/Icons';
import { dashboardSummary } from './dashboardSummary';
import { datasets } from './datasets';
import './dashboard.css';

export function Dashboard() {
  const dispatch = useAppDispatch();
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
        {summary.games.map(game => {
          const ds = datasets[game.id];
          return (
            <Link key={game.id} to={`/${game.id}`} className="db-card db-poster" onClick={() => dispatch(fetchData(game.id))}>
              <div className="db-art">
                <img src={ds.image} alt="" />
                <span className={`db-level db-level-${ds.level}`}>{ds.level}</span>
              </div>
              <div className="db-pbody">
                <h3>{ds.title}</h3>
                <p>{ds.blurb}</p>
                <div className="db-bar"><b style={{width: `${game.total ? game.solved / game.total * 100 : 0}%`}} /></div>
                <div className="db-row">
                  <span className="db-num">{game.solved}/{game.total}</span>
                  <span className="db-db">{ds.db}</span>
                </div>
              </div>
            </Link>
          );
        })}
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
