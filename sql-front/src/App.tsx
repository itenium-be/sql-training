import { TopNavigation } from './layout/TopNavigation'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './Home'
import { useAppSelector } from './store'
import { Exercise } from './exercises/Exercise'

export function App() {
  const exercises = useAppSelector(state => state.exercises.entities);

  return (
    <BrowserRouter>
      <Container style={{paddingTop: 15, paddingBottom: 25}}>
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
