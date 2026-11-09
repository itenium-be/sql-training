import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { config } from '../config';
import { loadScores } from '../layout/fetchData';
import { rankPlayers } from '../leaderboard/leaderboardData';
import { BeamerHeader, BeamerView } from './BeamerHeader';
import { BeamerPlayers } from './BeamerPlayers';
import { BeamerExercises } from './BeamerExercises';
import './beamer.css';

const REFRESH_MS = 5000;

function useFrameScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

export function Beamer() {
  const dispatch = useAppDispatch();
  const scores = useAppSelector(state => state.exercises.scores);
  const entities = useAppSelector(state => state.exercises.entities);
  const [view, setView] = useState<BeamerView>('players');
  const scale = useFrameScale();
  const you = localStorage.getItem('userName') ?? '';

  useEffect(() => {
    fetch(`${config.api}/exercises/definitions`)
      .then(res => res.json())
      .then(data => dispatch({type: 'exercises/setEntities', payload: data.responseObject}))
      .catch(err => console.error('Could not fetch exercises', err));

    dispatch(loadScores());
    const timer = setInterval(() => dispatch(loadScores()), REFRESH_MS);
    return () => clearInterval(timer);
  }, [dispatch]);

  const overall = rankPlayers(entities, scores);

  return (
    <div className="bm-stage">
      <div className="bm-frame" style={{transform: `scale(${scale})`}}>
        <BeamerHeader view={view} onSwitch={setView} />
        {scores.length === 0 ? (
          <div className="bm-body" style={{alignItems: 'center', justifyContent: 'center'}}>
            <div className="bm-title" style={{opacity: 0.7}}>Waiting for the first score…</div>
          </div>
        ) : view === 'players' ? (
          <BeamerPlayers rows={overall} you={you} />
        ) : (
          <BeamerExercises entities={entities} scores={scores} you={you} />
        )}
      </div>
    </div>
  );
}
