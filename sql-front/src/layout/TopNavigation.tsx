import { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';

export function TopNavigation() {
  const exercises = useAppSelector(state => state.exercises.entities);
  const [key, setKey] = useState('home');

  return (
    <Nav variant="tabs" activeKey={key} onSelect={k => setKey(k!)}>
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
