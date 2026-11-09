import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { config } from '../config';
import { useEffect } from 'react';
import { ExerciseId } from '../exercises/exerciseModels';
import { DatabaseIcon } from './Icons';

export const fetchData = (key: 'home' | ExerciseId) => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${config.leaderboard.api}/game`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!data.message) {
      dispatch({type: 'exercises/setScores', payload: data});
    }
  } catch (error) {
    console.error('Could not fetch leaderboard', error);
  }

  if (key === 'home') {
    dispatch({type: 'exercises/switch', payload: {key}});
    return;
  }

  try {
    const res = await fetch(`${config.api}/${key}/sampleData`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    dispatch({type: 'exercises/switch', payload: {key, data: data.responseObject}});
  } catch (error) {
    console.error('Could not fetch sample data', error);
    dispatch({type: 'exercises/switch', payload: {key, data: []}});
  }
};



export function TopNavigation() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const dispatch = useAppDispatch();
  const selected = useAppSelector(state => state.exercises.selected);
  const registeredName = useAppSelector(state => state.exercises.userName);

  useEffect(() => {
    if (document.location.pathname !== '/') {
      const selectedEx = document.location.pathname.substring(1);
      dispatch(fetchData(selectedEx as ExerciseId));
    }
  }, []);

  return (
    <>
    <header className="df-header">
      <Link to="/" className="df-brand" onClick={() => dispatch(fetchData('home'))}>
        <span className="df-brand-mark"><DatabaseIcon /></span>
        <span>
          <span className="df-brand-name">SQL Showdown</span>
          <span className="df-brand-sub">DevFest Paris 2026</span>
        </span>
      </Link>
      {registeredName && <span className="df-player" title={registeredName}>{registeredName}</span>}
    </header>
    <Nav variant="tabs" activeKey={selected ?? 'home'}>
      <Nav.Item>
        <Nav.Link as="span" eventKey="home">
          <Link to="/" onClick={() => dispatch(fetchData('home'))}>Home</Link>
        </Nav.Link>
      </Nav.Item>
      {registeredName && exercises.map(ex => (
        <Nav.Item key={ex.id}>
          <Nav.Link as="span" eventKey={ex.id}>
            <Link to={ex.id} onClick={() => dispatch(fetchData(ex.id))}>{ex.id}</Link>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
    </>
  );
}
