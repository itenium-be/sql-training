import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { ATTEMPTS_PER_PENALTY, ExerciseModel, ExpectedModel, SqlExerciseModel } from "./exerciseModels";
import { ExerciseSampleData, ExercisesData } from "./ExerciseSampleData";
import { authFetch, config } from "../config";
import { useAppDispatch, useAppSelector } from "../store";
import { Alert, Col, Modal, Row } from "react-bootstrap";
import { SqlEditor } from "./SqlEditor";

const emojis = ['🎉', '🥳', '🎊', '💯', '🌟', '🚀', '🦄', '🎈', '🎆', '🏆'];

export function Exercise({exercise}: {exercise: ExerciseModel}) {
  return (
    <>
      <h1>
        {exercise.name}
        <ExercisePoints exercise={exercise} />
        <ExerciseSchema exercise={exercise} />
      </h1>
      <p>{exercise.desc}</p>

      <h2>Example Data</h2>
      <pre>{exercise.sampleQuery}</pre>
      <ExerciseSampleData />

      <TheExercises exercise={exercise} />
    </>
  )
}

function TheExercises({exercise}: {exercise: ExerciseModel}) {
  const currentExIndex = useAppSelector(state => state.exercises.currentExercise);
  const dispatch = useAppDispatch();

  return (
    <>
      <h2>The Exercises</h2>
      {currentExIndex === 0 ? (
        <Button variant="success" onClick={() => dispatch({type: 'exercises/firstQuestion'})}>
          Let's Start
        </Button>
      ) : (
        <SqlExercises exercise={exercise} />
      )}
    </>
  )
}


function SqlExercises({exercise}: {exercise: ExerciseModel}) {
  const currentExIndex = useAppSelector(state => state.exercises.currentExercise);
  const currentEx = exercise.exercises.find(ex => ex.id === currentExIndex);
  const dispatch = useAppDispatch();

  if (!currentEx) {
    return (
      <>
        <h2>All Done!</h2>
        <p>Pick a different tab to continue scoring points!</p>
        <Button variant="secondary" onClick={() => dispatch({type: 'exercises/firstQuestion'})}>
          Back to first question
        </Button>
      </>
    )
  }

  return <SqlExercise sql={currentEx} />
}


function SqlExercise({sql}: {sql: SqlExerciseModel}) {
  const [sqlText, setSqlText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<null | any[]>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [expected, setExpected] = useState<ExpectedModel | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [cost, setCost] = useState<number | null>(null);
  const currentGame = useAppSelector(state => state.exercises.selected);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const solved = useAppSelector(state => state.exercises.scores
    .filter(score => score.player === registeredName)
    .some(score => score.game === currentGame && score.exerciseid === sql.id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    const startExercise = async () => {
      try {
        await authFetch(`${config.leaderboard.api}/game/start`, {
          method: 'POST',
          body: JSON.stringify({ game: currentGame, exerciseId: sql.id }),
        });
      } catch (err) {
        console.error('Could not start timer for exercise', err);
      }
    }

    startExercise();
  }, [sql])

  const reset = () => {
    setError('');
    setResult(null);
    setSuccess(false);
    setHint(null);
    setExpected(null);
    setCost(null);
    setPoints(null);
  }

  const handleFetch = async () => {
    try {
      setError('');
      setResult(null);
      setSuccess(false);

      const res = await authFetch(`${config.leaderboard.api}/game/check`, {
        method: 'POST',
        body: JSON.stringify({ game: currentGame, exerciseId: sql.id, solution: sqlText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Unable to check your solution 😭');
        return;
      }

      setResult(data.rows);
      if (!data.correct) {
        const penalty = data.attempts ? ` (wrong attempt #${data.attempts}, every ${ATTEMPTS_PER_PENALTY} cost a point)` : '';
        setError(`${data.message}${penalty}`);
        return;
      }

      setSuccess(true);
      setCost(typeof data.cost === 'number' ? data.cost : null);
      setPoints(typeof data.points === 'number' ? data.points : null);
      if (!data.recorded) {
        setError(data.message);
      }
    } catch (error) {
      console.error(`Error executing ${sqlText}`, error);
      setError('Unexpected error!');
    }
  };

  const requestHelp = async (type: 'hint' | 'expected') => {
    try {
      const res = await authFetch(`${config.leaderboard.api}/game/hint`, {
        method: 'POST',
        body: JSON.stringify({ game: currentGame, exerciseId: sql.id, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Could not fetch the hint');
        return;
      }
      if (type === 'hint') {
        setHint(data.hints);
      } else {
        setExpected(data);
      }
    } catch (err) {
      console.error(`Could not fetch ${type}`, err);
      setError('Could not fetch the hint');
    }
  };

  const exerciseHeader = (
    <>
      <h2>
        Exercise {sql.id}
        <Badge bg="info" style={{marginLeft: 8, fontSize: 14}}>
          {sql.points} point{sql.points === 1 ? '' : 's'}
        </Badge>
      </h2>
      <p>{sql.desc}</p>
    </>
  )

  if (solved) {
    return (
      <>
        {exerciseHeader}
        <ExerciseSolved sql={sql} reset={reset} text="Greato success, you've already solved this one!" />
      </>
    )
  }

  return (
    <>
      {exerciseHeader}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      <Row>
        <Col style={{paddingBottom: 12}}>
          <SqlEditor
            game={currentGame ?? ''}
            value={sqlText}
            onChange={setSqlText}
            onSubmit={() => { if (sqlText.trim().length && !success) handleFetch(); }}
          />
        </Col>
        <Col>
          {result ? (
            <div style={{maxHeight: 275, overflowY: 'auto'}}>
              <ExercisesData data={result} />
            </div>
          ) : (
            <p></p>
          )}
        </Col>
      </Row>

      {success ? (
        <ExerciseSolved sql={sql} reset={reset} cost={cost} points={points} />
      ) : (
        <>
          <Button variant="primary" onClick={handleFetch} style={{marginRight: 16}} disabled={!sqlText.length}>
            Submit
          </Button>
          <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/nextQuestion'})}} className="float-end">
            Skip Question
          </Button>
          {sql.id > 1 && (
            <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/prevQuestion'})}} className="float-end" style={{marginRight: 12}}>
              Back
            </Button>
          )}
          {result && !expected && (
            <Button variant="secondary" onClick={() => requestHelp('expected')} className="float-end" style={{marginRight: 12}}>
              Show Expected Result (−{sql.expectedCost} pt)
            </Button>
          )}
          {sql.hasHint && !hint && (
            <Button variant="secondary" onClick={() => requestHelp('hint')} className="float-end" style={{marginRight: 12}}>
              Show Hint (−{sql.hintCost} pt)
            </Button>
          )}
          {hint && (
            <div style={{paddingTop: 25}}>
              <h2>Hint</h2>
              <p>{hint}</p>
            </div>
          )}
          {expected && (
            <ExpectedTable expected={expected} />
          )}
        </>
      )}
    </>
  )
}

function ExerciseSolved({sql, reset, text, cost, points}: {sql: SqlExerciseModel, reset: Function, text?: string, cost?: number | null, points?: number | null}) {
  const scored = points ?? sql.points;
  const dispatch = useAppDispatch();

  return (
    <Alert variant="success">
      <Alert.Heading>
        {emojis[Math.floor(Math.random() * emojis.length)]}
        &nbsp;{text ?? 'Greato success'}
      </Alert.Heading>
      <Button variant="success" onClick={() => {reset(); dispatch({type: 'exercises/nextQuestion'})}} className="float-end">
        Next Question
      </Button>
      <div className="float-none" style={{marginBottom: 8}}>
        <b>You scored {scored} point{scored === 1 ? '' : 's'}!</b>
        {typeof cost === 'number' && <> Your query read {cost} page{cost === 1 ? '' : 's'}.</>}
      </div>
    </Alert>
  )
}


function ExpectedTable({expected}: {expected: ExpectedModel}) {
  const data = expected.expected.map(record => {
    const obj: any = {};
    expected.expectedColumns.forEach((colName, index) => obj[colName] = record[index])
    return obj;
  });

  return (
    <div style={{paddingTop: 25}}>
      <h2>Expected Result</h2>
      <ExercisesData data={data} />
    </div>
  )
}


function ExercisePoints({exercise}: {exercise: ExerciseModel}) {
  const totalPoints = exercise.exercises.reduce((pts, ex) => ex.points + pts, 0);

  return (
    <small>
      <Badge bg="primary" style={{fontSize: 14, marginLeft: 8}} title="Exercise count">
        #{exercise.exercises.length}
      </Badge>
      <Badge bg="primary" style={{fontSize: 14, marginLeft: 8}}>
        {totalPoints} points
      </Badge>
    </small>
  )
}



function ExerciseSchema({exercise}: {exercise: ExerciseModel}) {
  const [show, setShow] = useState(false);

  if (!exercise.schema) {
    return null;
  }

  return (
    <>
      <Button variant="info" className="float-end" style={{marginRight: 16, marginTop: 16}} onClick={() => setShow(true)}>
        View Database Schema
      </Button>
      {show && (
        <Modal show fullscreen onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{exercise.id}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <img src={`/${exercise.id}.png`} />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}
