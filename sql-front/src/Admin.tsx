import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Container, Form } from 'react-bootstrap';
import { adminFetch } from './adminApi';
import { AdminSubmissions } from './AdminSubmissions';
import { GameMode } from './game';

const API_KEY_STORAGE = 'adminApiKey';

const modeDescriptions: Record<GameMode, string> = {
  init: 'Lobby: players register and show up on the intro page',
  running: 'Game on: submissions are scored',
  end: 'Game over: submissions closed, all solutions visible',
};

export function Admin() {
  const [storedApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [apiKey, setApiKey] = useState(storedApiKey);
  const [authorized, setAuthorized] = useState(false);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [modes, setModes] = useState<GameMode[]>([]);
  const [message, setMessage] = useState('');

  const onLoginSuccess = useCallback((key: string, data: {mode: GameMode, modes: GameMode[]}) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setAuthorized(true);
    setMode(data.mode);
    setModes(data.modes);
    setMessage('');
  }, []);

  const onLoginFailure = useCallback((error: unknown) => {
    setAuthorized(false);
    setMessage(error instanceof Error ? error.message : String(error));
  }, []);

  const login = (key: string) => adminFetch(key, '').then(data => onLoginSuccess(key, data), onLoginFailure);

  const logout = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setAuthorized(false);
  };

  const changeMode = async (newMode: GameMode) => {
    try {
      const data = await adminFetch(apiKey, '/mode', {mode: newMode});
      setMode(data.mode);
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"][type="image/svg+xml"]');
    if (link) link.href = '/favicon-admin.svg';
  }, []);

  useEffect(() => {
    if (storedApiKey) {
      adminFetch(storedApiKey, '').then(data => onLoginSuccess(storedApiKey, data), onLoginFailure);
    }
  }, [storedApiKey, onLoginSuccess, onLoginFailure]);

  return (
    <Container style={{paddingTop: 15, paddingBottom: 25, maxWidth: 1100}}>
      <h1>Admin</h1>

      {!authorized ? (
        <div className="df-register">
          <Form.Group className="mb-3">
            <Form.Label htmlFor="apiKey">API key:</Form.Label>
            <Form.Control
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && apiKey) login(apiKey); }}
              autoFocus
            />
          </Form.Group>
          <Button variant="primary" onClick={() => login(apiKey)} disabled={!apiKey}>Login</Button>
        </div>
      ) : (
        <>
          <section className="df-register">
            <h2 style={{marginTop: 0}}>Game mode</h2>
            <ButtonGroup>
              {modes.map(m => (
                <Button key={m} variant={m === mode ? 'primary' : 'outline-primary'} onClick={() => changeMode(m)}>
                  {m}
                </Button>
              ))}
            </ButtonGroup>
            {mode && <p style={{marginTop: 12, marginBottom: 0}}>{modeDescriptions[mode]}</p>}
          </section>

          <AdminSubmissions apiKey={apiKey} />

          <Button variant="outline-secondary" size="sm" onClick={logout}>Logout</Button>
        </>
      )}

      {message && <Alert variant="info" style={{marginTop: 16}}>{message}</Alert>}
    </Container>
  );
}
