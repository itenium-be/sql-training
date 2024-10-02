import { fetchData, TopNavigation } from './layout/TopNavigation'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './Home'
import { useAppDispatch, useAppSelector } from './store'
import { Exercise } from './exercises/Exercise'
import { useEffect } from 'react'

export function App() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      dispatch({type: 'exercises/register', payload: name});
    }

    dispatch(fetchData('home'));
  }, []);

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
