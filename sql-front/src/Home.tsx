import { useEffect, useState } from "react";
import { config } from "./config";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "./store";

export function Home() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');
  const registeredName = useAppSelector(state => state.exercises.userName);
  const dispatch = useAppDispatch();

  if (registeredName) {
    return (
      <>
        <h1>Good Luck {registeredName}</h1>
        <ul>
          <li>Pick one of the tabs to start exercises and score points!</li>
          <li>ATTN: if a select has two times the same column name, the property values will be overwritten</li>
        </ul>
        <Scoreboard />
      </>
    )
  }

  const handleFetch = async () => {
    try {
      const res = await fetch(`${config.leaderboard.api}/game/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      setResponse(data.message);
      localStorage.setItem('userName', name);
      dispatch({type: 'exercises/register', payload: name});
    } catch (error: any) {
      console.error('Error:', error);
      setResponse(error.message);
    }
  };

  return (
    <>
      <h1>SQL Training</h1>
      <ul>
        <li>Register by completing the form below</li>
        <li>Then pick one of the tabs to start exercises and score points!</li>
        <li>ATTN: if a select has two times the same column name, the property values will be overwritten</li>
      </ul>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="inputName">Enter your name:</Form.Label>
        <Form.Control
          type="text"
          id="inputName"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" onClick={handleFetch} disabled={!name.length}>Submit</Button>
      {response && (
        <Alert variant="info" style={{marginTop: 16}}>{response}</Alert>
      )}
    </>
  )
}


type Score = {
  player: string;
  game: string;
  exerciseid: number;
  solutionlength: number;
  /** in seconds */
  elapsed: number;
}

function Scoreboard() {
  const [scores, setScores] = useState<Score[] | null>(null);

  useEffect(() => {
    const getScores = async () => {
      const res = await fetch(`${config.leaderboard.api}/game`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      // TODO: put it in the store so we know where we currently are...
      setScores(data);
    }

    getScores();
  }, [])

  return (
    <>
      <h1>Leaderboard</h1>
      {scores && <ScoreTable scores={scores} /> }
    </>
  )
}

function ScoreTable({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const exercisesPoints: any = {};
  exercises.forEach(game => {
    game.exercises.forEach(exercise => {
      exercisesPoints[`${game.id}-${exercise.id}`] = exercise.points;
    })
  })
  // console.log('exercisesPoints', exercisesPoints);

  const playerScores: Record<string, number> = {};
  scores.forEach(score => {
    if (!playerScores[score.player]) {
      playerScores[score.player] = 0;
    }
    const points = exercisesPoints[`${score.game}-${score.exerciseid}`];
    playerScores[score.player] += points || 0;
  });

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(playerScores).sort((a, b) => b[1] - a[1]).map(([player, score], index) => (
          <tr key={player} className={player === registeredName ? 'table-primary' : undefined}>
            <td>{index + 1}</td>
            <td>{player}</td>
            <td>{score}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
