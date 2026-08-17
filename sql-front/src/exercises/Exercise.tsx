import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { ExerciseId, ExerciseModel, SqlExerciseModel } from "./exerciseModels";
import { ExerciseSampleData, ExercisesData } from "./ExerciseSampleData";
import { config, HttpResponse, QueryResponse, QueryRow } from "../config";
import { useAppDispatch, useAppSelector } from "../store";
import { Alert, Col, Modal, Row } from "react-bootstrap";
import deepEqual from 'deep-equal';
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

  // Remount per question: attempts and hints are scored, so they must not
  // leak from the previous exercise.
  return <SqlExercise key={`${exercise.id}-${currentEx.id}`} sql={currentEx} game={exercise.id} />
}


function SqlExercise({sql, game}: {sql: SqlExerciseModel, game: ExerciseId}) {
  const [sqlText, setSqlText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [hint, setHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [running, setRunning] = useState(false);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const solved = useAppSelector(state => state.exercises.scores
    .filter(score => score.player === registeredName)
    .some(score => score.game === game && score.exerciseid === sql.id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    const startExercise = async () => {
      const postData = {
        player: localStorage.getItem('userName'),
        game,
        exerciseId: sql.id,
      };

      try {
        await fetch(`${config.leaderboard.api}/game/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
      } catch (err) {
        console.error('Could not start timer for exercise', err);
      }
    }

    startExercise();
  }, [sql, game])

  const reset = () => {
    setError('');
    setResult(null);
    setSuccess(false);
    setHint(false);
  }

  const handleFetch = async () => {
    if (running || !sqlText.trim()) {
      return;
    }

    const attempt = attempts + 1;
    setAttempts(attempt);
    setRunning(true);

    try {
      setError('');
      setResult(null);
      setSuccess(false);

      const res = await fetch(`${config.api}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: sqlText,
          game
        }),
      });
      const data: HttpResponse<QueryResponse> = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      const queryResult = data.responseObject;
      setResult(queryResult);

      const arrResult = queryResult.rows.map((obj: QueryRow) => {
        const record: (string | undefined)[] = [];
        Object.keys(obj).forEach(value => record.push(obj[value]?.toString()));
        return record;
      });

      const expectedArr = [...sql.expected];
      if (!sql.expectedOrder) {
        arrResult.sort();
        expectedArr.sort();
      }

      if (!deepEqual(arrResult, expectedArr)) {
        setError('Query result does not match expected output!');
        return;
      }

      setSuccess(true);

      const successData = {
        player: localStorage.getItem('userName'),
        game,
        exerciseId: sql.id,
        solution: sqlText,
        attempts: attempt,
        hintsUsed: hint ? 1 : 0,
        reads: queryResult.cost.reads,
        plannerCost: queryResult.cost.plannerCost,
        rowsScanned: queryResult.cost.rowsScanned,
      };

      try {
        await fetch(`${config.leaderboard.api}/game`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(successData),
        });
      } catch (err) {
        console.error('Could not submit score :(', err);
        setError('Unable to submit your score 😭');
      }
    } catch (error) {
      console.error(`Error executing ${sqlText}`, error);
      setError('Unexpected error!');
    } finally {
      setRunning(false);
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
          <SqlEditor game={game} value={sqlText} onChange={setSqlText} onSubmit={handleFetch} />
        </Col>
        <Col>
          {result ? (
            <>
              <div style={{maxHeight: 275, overflowY: 'auto'}}>
                <ExercisesData data={result.rows} />
              </div>
              {result.truncated && (
                <small className="text-muted">Only the first {result.rows.length} rows are shown.</small>
              )}
              <QueryCostBadges result={result} />
            </>
          ) : (
            <p></p>
          )}
        </Col>
      </Row>

      {success ? (
        <ExerciseSolved sql={sql} reset={reset} />
      ) : (
        <>
          <Button variant="primary" onClick={handleFetch} style={{marginRight: 16}} disabled={!sqlText.trim().length || running}>
            {running ? 'Running…' : 'Submit'}
          </Button>
          {attempts > 0 && (
            <small className="text-muted" style={{marginRight: 16}}>
              Attempt {attempts + 1} coming up{hint ? ', hint used' : ''}
            </small>
          )}
          <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/nextQuestion'})}} className="float-end">
            Skip Question
          </Button>
          {sql.id > 1 && (
            <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/prevQuestion'})}} className="float-end" style={{marginRight: 12}}>
              Back
            </Button>
          )}
          {result && !hint && (
            <Button variant="secondary" onClick={() => setHint(true)} className="float-end" style={{marginRight: 12}} title="Costs you the no-hints bonus">
              Show Hint
            </Button>
          )}
          {hint && (
            <HintTable sql={sql} />
          )}
        </>
      )}
    </>
  )
}


/** Immediate feedback on how much work the database did, since that is scored. */
function QueryCostBadges({result}: {result: QueryResponse}) {
  if (!result.cost.reads && !result.cost.plannerCost) {
    return null;
  }

  return (
    <div style={{marginTop: 8}}>
      <Badge bg="light" text="dark" title="Blocks read to answer this. Lower is better, and it does not depend on how busy the server is.">
        {result.cost.reads.toLocaleString('nl-BE')} reads
      </Badge>
      {result.cost.plannerCost > 0 && (
        <Badge bg="light" text="dark" style={{marginLeft: 6}} title="What the query planner estimated this would cost">
          cost {result.cost.plannerCost.toLocaleString('nl-BE')}
        </Badge>
      )}
      {result.cost.rowsScanned > 0 && (
        <Badge bg="light" text="dark" style={{marginLeft: 6}} title="Rows the plan walked over, across every step">
          {result.cost.rowsScanned.toLocaleString('nl-BE')} rows scanned
        </Badge>
      )}
    </div>
  )
}


function ExerciseSolved({sql, reset, text}: {sql: SqlExerciseModel, reset: Function, text?: string}) {
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
        <b>You scored {sql.points} point{sql.points === 1 ? '' : 's'}!</b>
      </div>
    </Alert>
  )
}


function HintTable({sql}: {sql: SqlExerciseModel}) {
  const data = sql.expected.map(record => {
    const obj: any = {};
    sql.expectedColumns.forEach((colName, index) => obj[colName] = record[index])
    return obj;
  });

  return (
    <div style={{paddingTop: 25}}>
      {sql.hints && (
        <>
          <h2>Hints</h2>
          <p>{sql.hints}</p>
        </>
      )}
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
