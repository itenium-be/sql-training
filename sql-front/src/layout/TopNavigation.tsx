import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { config } from '../config';
import { useEffect } from 'react';
import { ExerciseId } from '../exercises/exerciseModels';

export const fetchData = (key: 'home' | ExerciseId) => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${config.leaderboard.api}/game`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    dispatch({type: 'exercises/setScores', payload: data});
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
    <Nav variant="tabs" activeKey={selected ?? 'home'} onSelect={k => dispatch(fetchData(k as any))}>
      <Nav.Item>
        <Nav.Link as="span" eventKey="home">
          <Link to="/">Home</Link>
        </Nav.Link>
      </Nav.Item>
      {registeredName && exercises.map(ex => (
        <Nav.Item key={ex.id}>
          <Nav.Link as="span" eventKey={ex.id}>
            <Link to={ex.id}>{ex.id}</Link>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}
