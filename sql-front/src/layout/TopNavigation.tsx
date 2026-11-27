import Nav from 'react-bootstrap/Nav';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchData } from './fetchData';
import { useEffect } from 'react';
import { ExerciseId } from '../exercises/exerciseModels';
import Dropdown from 'react-bootstrap/Dropdown';
import { DatabaseIcon, MenuIcon } from './Icons';
import { avatarIndex, usePlayers } from '../game';
import { Avatar } from '../Avatar';
import { datasets } from '../dashboard/datasets';

export function TopNavigation() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const dispatch = useAppDispatch();
  const selected = useAppSelector(state => state.exercises.selected);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const [players] = usePlayers();
  const me = players.find(p => p.name.toLowerCase() === registeredName.toLowerCase());
  const { pathname } = useLocation();

  useEffect(() => {
    const selectedEx = document.location.pathname.substring(1);
    if (selectedEx in datasets) {
      dispatch(fetchData(selectedEx as ExerciseId));
    }
  }, [dispatch]);

  return (
    <>
    <header className="df-header">
      <Link to="/" className="df-brand" onClick={() => dispatch(fetchData('home'))}>
        <span className="df-brand-mark"><DatabaseIcon /></span>
        <span className="df-brand-name">SQL Showdown</span>
      </Link>
      <div className="df-header-right">
        <a href="/slides/" className="df-slides-link" target="_blank" rel="noreferrer">Slides</a>
        {registeredName && (
          <span className="df-player" title={registeredName}>
            {me && <Avatar index={avatarIndex(me)} label={registeredName} size={32} />}
            <span className="df-player-name">{registeredName}</span>
          </span>
        )}
        <Dropdown align="end" className="df-menu">
          <Dropdown.Toggle className="df-menu-toggle" aria-label="Menu">
            <MenuIcon />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {registeredName && (
              <>
                <Dropdown.Header>Datasets</Dropdown.Header>
                {exercises.map(ex => (
                  <Dropdown.Item key={ex.id} as={Link} to={ex.id} active={selected === ex.id} onClick={() => dispatch(fetchData(ex.id))}>
                    {ex.id}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
              </>
            )}
            <Dropdown.Item as={Link} to="/" active={pathname === '/'} onClick={() => dispatch(fetchData('home'))}>Dashboard</Dropdown.Item>
            <Dropdown.Item as={Link} to="/leaderboard" active={pathname === '/leaderboard'} onClick={() => dispatch(fetchData('home'))}>Leaderboard</Dropdown.Item>
            <Dropdown.Item href="/slides/" target="_blank" rel="noreferrer">Slides</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
    <div className="df-tabs">
      <NavLink to="/leaderboard" onClick={() => dispatch(fetchData('home'))} className={({isActive}) => isActive ? 'df-tab df-tab-active' : 'df-tab'}>Leaderboard</NavLink>
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
