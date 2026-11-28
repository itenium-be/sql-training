import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { fetchData } from '../layout/fetchData';
import { GameProgress } from './dashboardSummary';
import { datasets } from './datasets';
import './dashboard.css';

export function GamePoster({game}: {game: GameProgress}) {
  const dispatch = useAppDispatch();
  const ds = datasets[game.id];
  return (
    <Link to={`/${game.id}`} className="db-card db-poster" data-tour="poster" onClick={() => dispatch(fetchData(game.id))}>
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
}
