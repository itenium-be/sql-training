import { TopNavigation } from './layout/TopNavigation'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './Home';

export function App() {
  return (
    <BrowserRouter>
      <Container style={{paddingTop: 15}}>
        <TopNavigation />
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/ex1" element={ <Ex1 /> } />
          <Route path="/ex2" element={ <Ex2 /> } />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export function Ex1() {
  return (
    <>
      <h1>Ex1</h1>
    </>
  )
}


export function Ex2() {
  return (
    <>
      <h1>Ex2</h1>
    </>
  )
}
