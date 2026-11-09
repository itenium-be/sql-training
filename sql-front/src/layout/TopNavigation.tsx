import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchData } from './fetchData';
import { useEffect } from 'react';
import { ExerciseId } from '../exercises/exerciseModels';
import { DatabaseIcon } from './Icons';
import { avatarIndex, usePlayers } from '../game';
import { Avatar } from '../Avatar';

export function TopNavigation() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const dispatch = useAppDispatch();
  const selected = useAppSelector(state => state.exercises.selected);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const [players] = usePlayers();
  const me = players.find(p => p.name.toLowerCase() === registeredName.toLowerCase());

  useEffect(() => {
    if (document.location.pathname !== '/') {
      const selectedEx = document.location.pathname.substring(1);
      dispatch(fetchData(selectedEx as ExerciseId));
    }
  }, [dispatch]);

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
      <div className="df-header-right">
        <a href="/slides/" className="df-slides-link" target="_blank" rel="noreferrer">Slides</a>
        {registeredName && (
          <span className="df-player" title={registeredName}>
            {me && <Avatar index={avatarIndex(me)} label={registeredName} size={32} />}
            <span className="df-player-name">{registeredName}</span>
          </span>
        )}
      </div>
    </header>
    <div className="df-tabs">
      <Link to="/" onClick={() => dispatch(fetchData('home'))} className={selected ? 'df-tab' : 'df-tab df-tab-active'}>Leaderboard</Link>
      {registeredName && (
        <Nav variant="tabs" activeKey={selected ?? undefined}>
          {exercises.map(ex => (
            <Nav.Item key={ex.id}>
              <Nav.Link as="span" eventKey={ex.id}>
                <Link to={ex.id} onClick={() => dispatch(fetchData(ex.id))}>{ex.id}</Link>
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      )}
    </div>
    </>
  );
}
