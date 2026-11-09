import { fetchData, TopNavigation } from './layout/TopNavigation'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './Home'
import { useAppDispatch, useAppSelector } from './store'
import { Exercise } from './exercises/Exercise'
import { useEffect, useState } from 'react'
import { Intro } from './Intro'
import { Admin } from './Admin'
import { useGameMode } from './game'
import { config, TOKEN_STORAGE } from './config'

export function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <Admin />;
  }
  return <Game />;
}

function Game() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const dispatch = useAppDispatch();
  const registeredName = useAppSelector(state => state.exercises.userName);
  const [started, setStarted] = useState(false);
  const mode = useGameMode();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name && !localStorage.getItem(TOKEN_STORAGE)) {
      localStorage.removeItem('userName');
    } else if (name) {
      dispatch({type: 'exercises/register', payload: name});
    }

    fetch(`${config.api}/exercises/definitions`)
      .then(res => res.json())
      .then(data => dispatch({type: 'exercises/setEntities', payload: data.responseObject}))
      .catch(err => console.error('Could not fetch exercises', err));

    dispatch(fetchData('home'));
  }, []);

  if (mode === 'init' || (!registeredName && !started)) {
    return <Intro mode={mode} onStart={() => setStarted(true)} />;
  }

  return (
    <BrowserRouter>
      <Container style={{paddingTop: 15, paddingBottom: 25, maxWidth: '90%'}}>
        <TopNavigation />
        <Routes>
          <Route path="/" element={ <Home /> } />
          {exercises.map(ex => (
            <Route key={ex.id} path={ex.id} element={ <Exercise exercise={ex} /> } />
          ))}
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
