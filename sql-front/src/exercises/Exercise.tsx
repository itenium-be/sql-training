import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { ATTEMPTS_PER_PENALTY, ExerciseModel, ExpectedModel, SqlExerciseModel } from "./exerciseModels";
import { livePoints } from "./livePoints";
import { ExerciseSampleData, ExercisesData } from "./ExerciseSampleData";
import { authFetch, config } from "../config";
import { useAppDispatch, useAppSelector } from "../store";
import { Alert } from "react-bootstrap";
import { SqlEditor } from "./SqlEditor";
import { SchemaPanel } from "./SchemaPanel";
import { QuestionTimer } from "./QuestionTimer";
import { loadScores } from "../layout/fetchData";

const emojis = ['🎉', '🥳', '🎊', '💯', '🌟', '🚀', '🦄', '🎈', '🎆', '🏆'];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export function Exercise({exercise}: {exercise: ExerciseModel}) {
  const currentExIndex = useAppSelector(state => state.exercises.currentExercise);
  const dispatch = useAppDispatch();

  if (currentExIndex === 0) {
    return (
      <>
        <h1>
          {exercise.name}
          <ExercisePoints exercise={exercise} />
        </h1>
        <p>{exercise.desc}</p>
        <h2>Example Data</h2>
        <pre>{exercise.sampleQuery}</pre>
        <ExerciseSampleData />
        <Button variant="success" onClick={() => dispatch({type: 'exercises/firstQuestion'})}>
          Let's Start
        </Button>
      </>
    )
  }

  return <SqlExercises exercise={exercise} />
}


function SqlExercises({exercise}: {exercise: ExerciseModel}) {
  const currentExIndex = useAppSelector(state => state.exercises.currentExercise);
  const currentEx = exercise.exercises.find(ex => ex.id === currentExIndex);
  const dispatch = useAppDispatch();

  if (!currentEx) {
    return (
      <>
        <h1>{exercise.name}<ExercisePoints exercise={exercise} /></h1>
        <h2>All Done!</h2>
        <p>Pick a different tab to continue scoring points!</p>
        <Button variant="secondary" onClick={() => dispatch({type: 'exercises/firstQuestion'})}>
          Back to first question
        </Button>
      </>
    )
  }

  return <SqlExercise key={currentEx.id} exercise={exercise} sql={currentEx} />
}


function SqlExercise({exercise, sql}: {exercise: ExerciseModel, sql: SqlExerciseModel}) {
  const [sqlText, setSqlText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<null | Record<string, unknown>[]>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [expected, setExpected] = useState<ExpectedModel | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState(false);
  const [cost, setCost] = useState<number | null>(null);
  const [resultTab, setResultTab] = useState<'result' | 'expected' | 'sample'>('result');
  const [leftTab, setLeftTab] = useState<'exercises' | 'schema'>('exercises');
  const narrow = useMediaQuery('(max-width: 1100px)');
  const currentGame = useAppSelector(state => state.exercises.selected);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const scores = useAppSelector(state => state.exercises.scores);
  const solvedIds = new Set(scores
    .filter(score => score.player === registeredName && score.game === currentGame)
    .map(score => score.exerciseid));
  const solved = solvedIds.has(sql.id);
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
  }, [sql, currentGame])

  const reset = () => {
    setError('');
    setResult(null);
    setSuccess(false);
    setHint(null);
    setExpected(null);
    setCost(null);
    setPoints(null);
    setAttempts(0);
    setResultTab('result');
  }

  const goto = (id: number) => {
    reset();
    dispatch({type: 'exercises/gotoQuestion', payload: id});
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
      setResultTab('result');
      if (!data.correct) {
        if (typeof data.attempts === 'number') setAttempts(data.attempts);
        const penalty = data.attempts ? ` (wrong attempt #${data.attempts}, every ${ATTEMPTS_PER_PENALTY} cost a point)` : '';
        setError(`${data.message}${penalty}`);
        return;
      }

      setSuccess(true);
      setCost(typeof data.cost === 'number' ? data.cost : null);
      setPoints(typeof data.points === 'number' ? data.points : null);
      if (data.recorded) {
        dispatch(loadScores());
      } else {
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
        setResultTab('expected');
      }
    } catch (err) {
      console.error(`Could not fetch ${type}`, err);
      setError('Could not fetch the hint');
    }
  };

  const exercisesPanel = (
    <div className="df-panel-body">
      <div className="df-eyebrow">{exercise.name} · {exercise.exercises.length} exercises</div>
      <ol className="df-exgrid">
        {exercise.exercises.map(ex => {
          const state = solvedIds.has(ex.id) ? 'df-ex-solved' : 'df-ex-todo';
          const cls = ex.id === sql.id ? `${state} df-ex-current` : state;
          return (
            <li key={ex.id}>
              <button type="button" className={cls} onClick={() => goto(ex.id)} aria-current={ex.id === sql.id}>
                {ex.id}
              </button>
            </li>
          );
        })}
      </ol>

      <section className="df-excard">
        <div className="df-excard-head">
          <h2 className="df-excard-title">Exercise {sql.id}</h2>
          <PointsBadge sql={sql} hintUsed={hint !== null} expectedUsed={expected !== null} attempts={attempts} />
        </div>
        <p className="df-excard-desc">{sql.desc}</p>
        {sql.expectedColumns.length > 0 && (
          <div className="df-excard-cols">
            <div className="df-eyebrow df-excard-colslabel">Expected columns</div>
            <div className="df-chips">
              {sql.expectedColumns.map(col => <code key={col} className="df-chip">{col}</code>)}
            </div>
            <div className="df-excard-order">{sql.expectedOrder ? 'Order matters' : 'Any order'}</div>
          </div>
        )}
      </section>

      {sql.hasHint && (hint ? (
        <section className="df-hint">
          <div className="df-eyebrow">Hint</div>
          <p>{hint}</p>
        </section>
      ) : (
        <button type="button" className="df-reveal" onClick={() => requestHelp('hint')}>
          <span>💡 Reveal hint</span>
          <span className="df-cost">−{sql.hintCost} pt</span>
        </button>
      ))}

      <div className="df-panel-nav">
        {sql.id > 1 && (
          <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/prevQuestion'})}} style={{flex: 1}}>
            Previous
          </Button>
        )}
        <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/nextQuestion'})}} style={{flex: 1}}>
          {solved ? 'Next' : 'Skip'}
        </Button>
      </div>
    </div>
  );

  if (solved) {
    return (
      <div className="df-ide">
        <aside className="df-ide-left">{exercisesPanel}</aside>
        <section className="df-ide-main">
          <ExerciseSolved sql={sql} reset={reset} text="Greato success, you've already solved this one!" />
        </section>
        {!narrow && <aside className="df-ide-schema">{<SchemaPanel game={currentGame ?? ''} sqlText={sqlText} />}</aside>}
      </div>
    )
  }

  return (
    <div className="df-ide">
      <aside className="df-ide-left">
        {narrow && (
          <div className="df-paneltabs" role="tablist">
            <button type="button" role="tab" aria-selected={leftTab === 'exercises'} onClick={() => setLeftTab('exercises')}>Exercises</button>
            <button type="button" role="tab" aria-selected={leftTab === 'schema'} onClick={() => setLeftTab('schema')}>Schema</button>
          </div>
        )}
        {!narrow || leftTab === 'exercises'
          ? exercisesPanel
          : <SchemaPanel game={currentGame ?? ''} sqlText={sqlText} />}
      </aside>

      <section className="df-ide-main">
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        {success ? (
          <ExerciseSolved sql={sql} reset={reset} cost={cost} points={points} />
        ) : (
          <>
            <div className="df-editor">
              <div className="df-editor-head">
                <span className="df-editor-dialect">{currentGame === 'Worldcup' ? 'SQL Server' : 'PostgreSQL'}</span>
                <QuestionTimer />
                <Button variant="primary" onClick={handleFetch} disabled={!sqlText.length} className="df-editor-submit">
                  Submit&nbsp;&nbsp;⌘↵
                </Button>
              </div>
              <SqlEditor
                game={currentGame ?? ''}
                value={sqlText}
                onChange={setSqlText}
                onSubmit={() => { if (sqlText.trim().length && !success) handleFetch(); }}
              />
            </div>

            <div className="df-results">
              <div className="df-rtabs" role="tablist">
                <button type="button" role="tab" aria-selected={resultTab === 'result'} onClick={() => setResultTab('result')}>Your result</button>
                <button type="button" role="tab" aria-selected={resultTab === 'expected'} onClick={() => setResultTab('expected')}>
                  {expected ? 'Expected' : '🔒 Expected'}
                </button>
                <button type="button" role="tab" aria-selected={resultTab === 'sample'} onClick={() => setResultTab('sample')}>Sample data</button>
              </div>
              <div className="df-results-body">
                {resultTab === 'result' && (
                  result ? <ExercisesData data={result} /> : <p className="df-results-empty">Run your query to see your result here.</p>
                )}
                {resultTab === 'expected' && (
                  expected
                    ? <ExercisesData data={expectedRows(expected)} />
                    : <RevealExpected cost={sql.expectedCost} onReveal={() => requestHelp('expected')} />
                )}
                {resultTab === 'sample' && (
                  <>
                    <pre className="df-sample-query">{exercise.sampleQuery}</pre>
                    <ExerciseSampleData />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {!narrow && <aside className="df-ide-schema">{<SchemaPanel game={currentGame ?? ''} sqlText={sqlText} />}</aside>}
    </div>
  )
}


function PointsBadge({sql, hintUsed, expectedUsed, attempts}: {sql: SqlExerciseModel, hintUsed: boolean, expectedUsed: boolean, attempts: number}) {
  const live = livePoints(sql, {hintUsed, expectedUsed, attempts});
  if (live === sql.points) {
    return <Badge bg="info">{sql.points} point{sql.points === 1 ? '' : 's'}</Badge>;
  }
  return (
    <span className="df-points-ghost" title={`Down from ${sql.points} — points spent on help and wrong attempts`}>
      <span className="df-points-now">{live}</span>
      <span className="df-points-max">/ {sql.points}</span>
      <span className="df-points-unit">pts</span>
    </span>
  );
}


function RevealExpected({cost, onReveal}: {cost: number, onReveal: () => void}) {
  return (
    <div className="df-locked">
      <div className="df-locked-icon">🔒</div>
      <div className="df-locked-title">Expected result is hidden</div>
      <p className="df-locked-text">Reveal the expected rows to compare them against yours. Revealing costs {cost} point{cost === 1 ? '' : 's'} on this exercise.</p>
      <Button variant="primary" onClick={onReveal}>
        Reveal expected result&nbsp;&nbsp;<span className="df-cost-inline">−{cost} pt</span>
      </Button>
    </div>
  )
}


function expectedRows(expected: ExpectedModel): Record<string, unknown>[] {
  return expected.expected.map(record => {
    const obj: Record<string, unknown> = {};
    expected.expectedColumns.forEach((colName, index) => obj[colName] = record[index]);
    return obj;
  });
}


function ExerciseSolved({sql, reset, text, cost, points}: {sql: SqlExerciseModel, reset: () => void, text?: string, cost?: number | null, points?: number | null}) {
  const scored = points ?? sql.points;
  const [emoji] = useState(() => emojis[Math.floor(Math.random() * emojis.length)]);
  const dispatch = useAppDispatch();

  return (
    <Alert variant="success">
      <Alert.Heading>
        {emoji}
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
