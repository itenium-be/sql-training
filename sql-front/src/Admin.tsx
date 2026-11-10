import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Container, Form } from 'react-bootstrap';
import { adminFetch } from './adminApi';
import { config } from './config';
import { GameMode } from './game';
import { ExerciseModel } from './exercises/exerciseModels';
import { normalizeScores } from './exercises/normalizeScores';
import { AdminOverview } from './admin/adminData';
import { OverviewTab } from './admin/OverviewTab';
import { PlayersTab } from './admin/PlayersTab';
import { ExercisesTab } from './admin/ExercisesTab';
import './admin/admin.css';

const API_KEY_STORAGE = 'adminApiKey';
const REFRESH_MS = 5000;

const modeLabels: Record<GameMode, string> = { init: 'Lobby', running: 'Running', end: 'Ended' };
type Tab = 'overview' | 'players' | 'exercises';
type Health = { db: boolean; backend: boolean };

export function Admin() {
  const [storedApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [apiKey, setApiKey] = useState(storedApiKey);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [entities, setEntities] = useState<ExerciseModel[]>([]);
  const [health, setHealth] = useState<Health>({ db: false, backend: false });
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback((key: string) => {
    adminFetch(key, '/overview').then((data: AdminOverview) => {
      setOverview({ ...data, progress: normalizeScores(data.progress) });
      setNow(Date.now());
    }, () => {});
    adminFetch(key, '/health').then(setHealth, () => {});
  }, []);

  const onAuthorized = useCallback((key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setAuthorized(true);
    setMessage('');
    load(key);
  }, [load]);

  const login = (key: string) => adminFetch(key, '').then(
    () => onAuthorized(key),
    (error: unknown) => { setAuthorized(false); setMessage(error instanceof Error ? error.message : String(error)); },
  );

  const logout = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setAuthorized(false);
    setOverview(null);
  };

  const changeMode = async (mode: GameMode) => {
    try {
      const data = await adminFetch(apiKey, '/mode', { mode });
      setMessage(data.message);
      load(apiKey);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"][type="image/svg+xml"]');
    if (link) link.href = '/favicon-admin.svg';
  }, []);

  useEffect(() => {
    fetch(`${config.api}/exercises/definitions`)
      .then(res => res.json())
      .then(data => setEntities(data.responseObject))
      .catch(err => console.error('Could not fetch exercises', err));
  }, []);

  useEffect(() => {
    if (storedApiKey) login(storedApiKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedApiKey]);

  useEffect(() => {
    if (!authorized) return;
    const timer = setInterval(() => load(apiKey), REFRESH_MS);
    return () => clearInterval(timer);
  }, [authorized, apiKey, load]);

  if (!authorized) {
    return (
      <Container style={{ paddingTop: 15, maxWidth: 1100 }}>
        <h1>Admin</h1>
        <div className="df-register">
          <Form.Group className="mb-3">
            <Form.Label htmlFor="apiKey">API key:</Form.Label>
            <Form.Control type="password" id="apiKey" value={apiKey} autoFocus
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && apiKey) login(apiKey); }} />
          </Form.Group>
          <Button variant="primary" onClick={() => login(apiKey)} disabled={!apiKey}>Login</Button>
        </div>
        {message && <Alert variant="info" style={{ marginTop: 16 }}>{message}</Alert>}
      </Container>
    );
  }

  return (
    <Container fluid={tab === 'exercises'} style={{ paddingTop: 0, paddingBottom: 25, maxWidth: tab === 'exercises' ? 2400 : 1180 }}>
      <div className="adm-hdr">
        <div>
          <div className="df-eyebrow">SQL Training · Admin</div>
          <h1 style={{ fontSize: '1.4rem', marginTop: 2 }}>Game control</h1>
        </div>
        {overview && (
          <ButtonGroup style={{ marginLeft: 8 }}>
            {overview.modes.map(m => (
              <Button key={m} size="sm" variant={m === overview.mode ? 'primary' : 'outline-primary'} onClick={() => changeMode(m)}>
                {modeLabels[m]}
              </Button>
            ))}
          </ButtonGroup>
        )}
        <div className="adm-health">
          <span><span className={`adm-dot ${health.backend ? 'adm-dot-up' : 'adm-dot-down'}`} />API</span>
          <span><span className={`adm-dot ${health.db ? 'adm-dot-up' : 'adm-dot-down'}`} />DB</span>
          <Button href="/beamer" target="_blank" rel="noreferrer" variant="outline-primary" size="sm">Open beamer ↗</Button>
          <Button variant="outline-secondary" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>

      <nav className="adm-tabs">
        <button className={`adm-tab ${tab === 'overview' ? 'adm-on' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`adm-tab ${tab === 'players' ? 'adm-on' : ''}`} onClick={() => setTab('players')}>
          Players{overview && <span className="adm-badge">{overview.players.length}</span>}
        </button>
        <button className={`adm-tab ${tab === 'exercises' ? 'adm-on' : ''}`} onClick={() => setTab('exercises')}>Exercises</button>
      </nav>

      {overview && tab === 'overview' && <OverviewTab overview={overview} entities={entities} now={now} />}
      {overview && tab === 'players' && <PlayersTab overview={overview} entities={entities} now={now} />}
      {overview && tab === 'exercises' && <ExercisesTab overview={overview} entities={entities} />}

      {message && <Alert variant="info" style={{ marginTop: 16 }}>{message}</Alert>}
    </Container>
  );
}
