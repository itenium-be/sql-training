import { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

export function TopNavigation() {
  const [key, setKey] = useState('home');

  return (
    <Nav variant="tabs" activeKey={key} onSelect={k => setKey(k!)}>
      <Nav.Item>
        <Nav.Link as="span" eventKey="home">
          <Link to="/">Home</Link>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as="span" eventKey="ex1">
          <Link to="/ex1">Ex1</Link>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as="span" eventKey="ex2">
          <Link to="/ex2">Ex2</Link>
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}
