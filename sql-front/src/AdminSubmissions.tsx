import { useEffect, useState } from 'react';
import { Alert, Badge, Button, ButtonGroup, Form, Table } from 'react-bootstrap';
import { adminFetch } from './adminApi';

type Solution = {
  game: string;
  exerciseId: number;
  desc: string;
  points: number;
  solution: string;
};

type Submission = {
  id: number;
  player: string;
  game: string;
  exerciseid: number;
  solution: string;
  correct: boolean;
  message: string | null;
  submittedat: string;
};

type View = 'question' | 'player';

const exKey = (game: string, exerciseId: number | string) => `${game}-${exerciseId}`;

function SqlBlock({sql}: {sql: string}) {
  return <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>{sql}</pre>;
}

function SubmissionRows({submissions, label}: {submissions: Submission[], label: (s: Submission) => string}) {
  return (
    <Table bordered size="sm">
      <tbody>
        {submissions.map(s => (
          <tr key={s.id} className={s.correct ? 'table-success' : undefined}>
            <td style={{width: 200, whiteSpace: 'nowrap'}}>
              {label(s)}<br />
              <small className="text-muted">{new Date(s.submittedat).toLocaleTimeString()}</small>{' '}
              <Badge bg={s.correct ? 'success' : 'danger'}>{s.correct ? 'correct' : 'wrong'}</Badge>
            </td>
            <td>
              <SqlBlock sql={s.solution} />
              {!s.correct && s.message && <small className="text-danger">{s.message}</small>}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Reference({solution}: {solution: Solution}) {
  return (
    <div className="df-register" style={{marginBottom: 12}}>
      <strong>{exKey(solution.game, solution.exerciseId)}</strong> <Badge bg="secondary">{solution.points} points</Badge>
      <p style={{margin: '6px 0'}}>{solution.desc}</p>
      <details>
        <summary>Reference solution</summary>
        <SqlBlock sql={solution.solution} />
      </details>
    </div>
  );
}

export function AdminSubmissions({apiKey}: {apiKey: string}) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [view, setView] = useState<View>('question');
  const [exercise, setExercise] = useState('');
  const [player, setPlayer] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await adminFetch(apiKey, '/submissions');
      setSolutions(data.solutions);
      setSubmissions(data.submissions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    load();
  }, [apiKey]);

  const players = [...new Set(submissions.map(s => s.player))].sort((a, b) => a.localeCompare(b));
  const countFor = (key: string) => submissions.filter(s => exKey(s.game, s.exerciseid) === key).length;
  const selectedSolution = solutions.find(s => exKey(s.game, s.exerciseId) === exercise);

  return (
    <section className="df-register">
      <h2 style={{marginTop: 0}}>Submissions</h2>
      <div style={{display: 'flex', gap: 12, marginBottom: 12}}>
        <ButtonGroup>
          <Button variant={view === 'question' ? 'primary' : 'outline-primary'} onClick={() => setView('question')}>Per question</Button>
          <Button variant={view === 'player' ? 'primary' : 'outline-primary'} onClick={() => setView('player')}>Per player</Button>
        </ButtonGroup>
        <Button variant="outline-secondary" onClick={load}>Refresh</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {view === 'question' && (
        <>
          <Form.Select value={exercise} onChange={e => setExercise(e.target.value)} style={{marginBottom: 12}}>
            <option value="">Select a question...</option>
            {solutions.map(s => {
              const key = exKey(s.game, s.exerciseId);
              return <option key={key} value={key}>{key} ({countFor(key)}): {s.desc}</option>;
            })}
          </Form.Select>
          {selectedSolution && (
            <>
              <Reference solution={selectedSolution} />
              {players
                .map(p => ({p, subs: submissions.filter(s => s.player === p && exKey(s.game, s.exerciseid) === exercise)}))
                .filter(x => x.subs.length)
                .map(x => <SubmissionRows key={x.p} submissions={x.subs} label={s => s.player} />)}
            </>
          )}
        </>
      )}

      {view === 'player' && (
        <>
          <Form.Select value={player} onChange={e => setPlayer(e.target.value)} style={{marginBottom: 12}}>
            <option value="">Select a player...</option>
            {players.map(p => <option key={p} value={p}>{p}</option>)}
          </Form.Select>
          {player && solutions
            .map(sol => ({sol, subs: submissions.filter(s => s.player === player && exKey(s.game, s.exerciseid) === exKey(sol.game, sol.exerciseId))}))
            .filter(x => x.subs.length)
            .map(x => (
              <div key={exKey(x.sol.game, x.sol.exerciseId)}>
                <Reference solution={x.sol} />
                <SubmissionRows submissions={x.subs} label={() => exKey(x.sol.game, x.sol.exerciseId)} />
              </div>
            ))}
        </>
      )}
    </section>
  );
}
