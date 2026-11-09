import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { config } from '../config';
import { loadScores } from '../layout/fetchData';
import { usePlayers } from '../game';
import { rankPlayers } from '../leaderboard/leaderboardData';
import { BeamerHeader, BeamerView } from './BeamerHeader';
import { BeamerPlayers } from './BeamerPlayers';
import { BeamerExercises } from './BeamerExercises';
import './beamer.css';

const REFRESH_MS = 5000;

export function Beamer({projector = false}: {projector?: boolean}) {
  const dispatch = useAppDispatch();
  const scores = useAppSelector(state => state.exercises.scores);
  const entities = useAppSelector(state => state.exercises.entities);
  const storeName = useAppSelector(state => state.exercises.userName);
  const [players] = usePlayers();
  const [view, setView] = useState<BeamerView>('players');
  const you = storeName || localStorage.getItem('userName') || '';

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

  const frame = (
    <div className={projector ? 'bm-frame' : 'bm-frame bm-frame-inline'}>
      <BeamerHeader view={view} onSwitch={setView} bare={!projector} />
      {scores.length === 0 ? (
        <div className="bm-body bm-body-empty">
          <div className="bm-title" style={{opacity: 0.7}}>Waiting for the first score…</div>
        </div>
      ) : view === 'players' ? (
        <BeamerPlayers rows={overall} you={you} players={players} showStanding={!projector} />
      ) : (
        <BeamerExercises entities={entities} scores={scores} you={you} />
      )}
    </div>
  );

  return projector ? <div className="bm-stage">{frame}</div> : frame;
}
