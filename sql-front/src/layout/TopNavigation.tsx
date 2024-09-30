import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { config } from '../config';
import { useEffect } from 'react';


export const fetchData = (key: string) => async (dispatch: AppDispatch) => {
  if (key === 'home') {
    dispatch({type: 'exercises/switch', payload: {key}});
    return;
  }

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

  try {
    const res = await fetch(`${config.api}/${key}/sampleData`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    dispatch({type: 'exercises/switch', payload: {key, data: data.responseObject}});
  } catch (error) {
    console.error('Could not fetch sample data', error);
  }
};



export function TopNavigation() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const dispatch = useAppDispatch();
  const selected = useAppSelector(state => state.exercises.selected);

  useEffect(() => {
    if (document.location.pathname !== '/') {
      const selectedEx = document.location.pathname.substring(1);
      dispatch(fetchData(selectedEx));
    }
  }, []);

  return (
    <Nav variant="tabs" activeKey={selected ?? 'home'} onSelect={k => dispatch(fetchData(k))}>
      <Nav.Item>
        <Nav.Link as="span" eventKey="home">
          <Link to="/">Home</Link>
        </Nav.Link>
      </Nav.Item>
      {exercises.map(ex => (
        <Nav.Item key={ex.id}>
          <Nav.Link as="span" eventKey={ex.id}>
            <Link to={ex.id}>{ex.id}</Link>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}
