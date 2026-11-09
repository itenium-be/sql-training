import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { config } from './config';
import { useAppDispatch } from './store';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');
  const dispatch = useAppDispatch();

  const register = async () => {
    try {
      const res = await fetch(`${config.leaderboard.api}/game/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      setResponse(data.message);
      if (res.status === 200) {
        const registered = data.name ?? name.trim();
        localStorage.setItem('userName', registered);
        dispatch({type: 'exercises/register', payload: registered});
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResponse(error.message);
    }
  };

  return (
    <div className="df-register">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="inputName">Enter your name:</Form.Label>
        <Form.Control
          type="text"
          id="inputName"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) register(); }}
          autoFocus
        />
      </Form.Group>

      <Button variant="primary" onClick={register} disabled={!name.trim().length}>Enter the arena</Button>
      {response && (
        <Alert variant="info" style={{marginTop: 16}}>{response}</Alert>
      )}
    </div>
  );
}
