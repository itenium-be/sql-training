import { useState } from "react";
import { config } from "./config";
import { Alert, Button, Form, Table, Image, Row } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "./store";
import { Score } from "./exercises/exerciseModels";

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

      <Row style={{marginTop: 25}}>
        <h2>It's Meme Time</h2>
        <p>Refresh for a different one! <small>Clear localStorage after logging in for more memes!</small></p>
        <Image src={`/memes/sql-${Math.floor(Math.random() * 18) + 1}.png`} rounded style={{width: 'auto', height: 'auto'}} />
      </Row>
    </>
  )
}

function Scoreboard() {
  const scores = useAppSelector(state => state.exercises.scores);

  if (!scores.length) {
    return (
      <>
        <h1>Leaderboard</h1>
        <p>Be the first to score points!</p>
      </>
    );
  }

  return (
    <>
      <h1>Leaderboard</h1>
      <ScoreTable scores={scores} />

      <h2>Fastest Scorers</h2>
      <FastestScorers scores={scores} />

      <h2>Your Scores</h2>
      <YourScores scores={scores} />
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

type FastestExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  player: string;
  time: number;
}

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}m ${secs}s`;
}

function FastestScorers({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const fastestTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => {
      return {
        game: game.id,
        exerciseId: ex.id,
        exercise: ex.desc,
        player: '',
        time: 0,
      }
    })
    return cur.concat(gameExs);
  }, [] as FastestExercise[]);
  // console.log('fastest', fastestTable);
  // console.log('scores', scores);

  fastestTable.forEach(fastest => {
    const exScores = scores
      .filter(score => score.game === fastest.game && score.exerciseid === fastest.exerciseId)
      .sort((a, b) => b.elapsed - a.elapsed);

    if (exScores.length) {
      fastest.player = exScores[0].player;
      fastest.time = exScores[0].elapsed;
    }
  })

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Player</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {fastestTable.filter(fast => !!fast.player).map(fast => (
          <tr key={fast.game + '-' + fast.exerciseId} className={fast.player === registeredName ? 'table-primary' : undefined}>
            <td>{fast.game}-{fast.exerciseId}</td>
            <td>{fast.exercise}</td>
            <td>{fast.player}</td>
            <td>{formatSeconds(fast.time)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function YourScores({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);

  const fullGame: any = {};
  exercises.forEach(game => {
    game.exercises.forEach(exercise => {
      fullGame[`${game.id}-${exercise.id}`] = exercise;
    })
  })

  const yourScores = scores
    .filter(score => score.player === registeredName)
    .sort((a, b) => `${a.game}-${a.exerciseid}`.localeCompare(`${b.game}-${b.exerciseid}`))

  return (
    <Table bordered striped>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Points</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {yourScores.map(yourScore => (
          <tr key={yourScore.game + '-' + yourScore.exerciseid}>
            <td>{yourScore.game}-{yourScore.exerciseid}</td>
            <td>{fullGame[yourScore.game + '-' + yourScore.exerciseid].desc}</td>
            <td>{fullGame[yourScore.game + '-' + yourScore.exerciseid].points}</td>
            <td>{formatSeconds(yourScore.elapsed)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
