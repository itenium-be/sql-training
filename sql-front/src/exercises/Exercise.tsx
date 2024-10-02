import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { ExerciseId, ExerciseModel, SqlExerciseModel } from "./exerciseModels";
import { ExerciseSampleData, ExercisesData } from "./ExerciseSampleData";
import { config, HttpResponse } from "../config";
import { useAppDispatch, useAppSelector } from "../store";
import { Alert, Col, Modal, Row } from "react-bootstrap";
import deepEqual from 'deep-equal';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

const emojis = ['🎉', '🥳', '🎊', '💯', '🌟', '🚀', '🦄', '🎈', '🎆', '🏆'];

export function Exercise({exercise}: {exercise: ExerciseModel}) {
  return (
    <>
      <h1>
        {exercise.name}
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
  const [start, setStart] = useState(false);

  return (
    <>
      <h2>The Exercises</h2>
      {!start ? (
        <Button variant="success" onClick={() => setStart(true)}>Let's Start</Button>
      ) : (
        <SqlExercises exercise={exercise} />
      )}
    </>
  )
}


function SqlExercises({exercise}: {exercise: ExerciseModel}) {
  let currentGame = useAppSelector(state => state.exercises.selected);
  // HACK: not clicking on the link but on the cell resets the selected exercise
  // HACK: This is an issue in TopNavigation with <Nav.Link> vs <Link>
  currentGame ??= document.location.pathname.substring(1) as ExerciseId;
  const currentExIndex = useAppSelector(state => state.exercises[currentGame!].currentExercise);
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
  const [hint, setHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const currentGame = useAppSelector(state => state.exercises.selected);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const solved = useAppSelector(state => state.exercises.scores
    .filter(score => score.player === registeredName)
    .some(score => score.game === currentGame && score.exerciseid === sql.id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    const startExercise = async () => {
      const postData = {
        player: localStorage.getItem('userName'),
        game: currentGame,
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
  }, [sql])

  const reset = () => {
    setError('');
    setResult(null);
    setSuccess(false);
    setHint(false);
  }

  const handleFetch = async () => {
    try {
      setError('');
      setResult(null);
      setSuccess(false);

      const res = await fetch(`${config.api}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlText }),
      });
      const data: HttpResponse = await res.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setResult(data.responseObject);

        const arrResult = data.responseObject.map((obj: any) => {
          const record: any[] = [];
          Object.keys(obj).forEach(value => record.push(obj[value]?.toString()));
          return record;
        });

        let expectedArr = [...sql.expected];
        if (!sql.expectedOrder) {
          arrResult.sort();
          expectedArr.sort();
        }

        if (deepEqual(arrResult, expectedArr)) {
          setSuccess(true);

          const successData = {
            player: localStorage.getItem('userName'),
            game: currentGame,
            exerciseId: sql.id,
            solution: sqlText,
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

        } else {
          setError('Query result does not match expected output!');
        }
      }
    } catch (error) {
      console.error(`Error executing ${sqlText}`, error);
      setError('Unexpected error!');
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
          <AceEditor
            mode="sql"
            theme="monokai"
            width="100%"
            height="275px"
            fontSize={18}
            showPrintMargin={false}
            showGutter
            wrapEnabled
            enableLiveAutocompletion
            onChange={e => setSqlText(e)}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ enableLiveAutocompletion: true, }}
            placeholder="Enter your SQL"
            focus
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
        <ExerciseSolved sql={sql} reset={reset} />
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
          {result && (
            <Button variant="secondary" onClick={() => setHint(true)} className="float-end" style={{marginRight: 12}}>
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
