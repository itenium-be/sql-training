import { Alert, Button, Form } from 'react-bootstrap';
import { useRegister } from './useRegister';

export function RegisterForm() {
  const { name, setName, response, register } = useRegister();

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
          onKeyDown={e => { if (e.key === 'Enter') register(); }}
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
