import { Fragment, useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { ATTEMPTS_PER_PENALTY, ExerciseDetails, ExerciseId, ExerciseModel, ExpectedModel, SqlExerciseModel } from "./exerciseModels";
import { livePoints } from "./livePoints";
import { ExerciseSampleData, ExercisesData } from "./ExerciseSampleData";
import { ResultDiffTable } from "./ResultDiffTable";
import { SampleQuery } from "./SampleQuery";
import { sampleTables } from "./sampleTables";
import { authFetch, config } from "../config";
import { useAppDispatch, useAppSelector } from "../store";
import { Alert, Modal } from "react-bootstrap";
import { SqlEditor } from "./SqlEditor";
import { SchemaPanel } from "./SchemaPanel";
import { SchemaDiagram } from "./SchemaDiagram";
import { QuestionTimer } from "./QuestionTimer";
import { originFromElapsed } from "./questionElapsed";
import { ActivityRow, findActivity } from "./myActivity";
import { PostgresIcon, SqlServerIcon } from "../layout/Icons";
import { loadDraft, saveDraft } from "./sqlDraft";
import { telemetrySnapshot } from "./editorTelemetry";
import { useNavigate } from "react-router-dom";
import { fetchData, loadScores } from "../layout/fetchData";
import { dashboardSummary } from "../dashboard/dashboardSummary";
import { datasets } from "../dashboard/datasets";
import { GamePoster } from "../dashboard/GamePoster";
import { nextGame } from "../dashboard/nextGame";
import { SolutionsPanel } from "./SolutionsPanel";

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
    return <ExerciseIntro exercise={exercise} onStart={() => dispatch({type: 'exercises/firstQuestion'})} />;
  }

  return <SqlExercises exercise={exercise} />
}


function ExerciseIntro({exercise, onStart}: {exercise: ExerciseModel, onStart: () => void}) {
  const [tab, setTab] = useState<'sample' | 'diagram'>('sample');

  return (
    <>
      <div className="df-eyebrow df-intro-eyebrow">Playground</div>
      <h1 className="df-intro-title">{exercise.name}</h1>
      <p className="df-intro-desc">{exercise.desc}</p>
      <ExerciseMeta exercise={exercise} />
      <Button variant="success" className="df-mobile-only" onClick={onStart} data-tour="start">
        Let's Start
      </Button>
      <div data-tour="intro-panel">
        <div className="df-rtabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'sample'} onClick={() => setTab('sample')} data-tour="intro-sample-tab">Sample</button>
          <button type="button" role="tab" aria-selected={tab === 'diagram'} onClick={() => setTab('diagram')} data-tour="intro-diagram-tab">Diagram</button>
        </div>
        {tab === 'sample' ? (
          <>
            <SampleNote query={exercise.sampleQuery} />
            <SampleQuery query={exercise.sampleQuery} game={exercise.id} className="df-sample-query" />
            <div className="df-sample-returns">↓ returns</div>
            <ExerciseSampleData />
          </>
        ) : (
          <div className="df-intro-diagram">
            <SchemaDiagram game={exercise.id} />
          </div>
        )}
      </div>
      <Button variant="success" onClick={onStart} data-tour="start">
        Let's Start
      </Button>
    </>
  );
}


function SampleNote({query}: {query: string}) {
  const tables = sampleTables(query);
  return (
    <div className="df-sample-note">
      <span aria-hidden="true">💡</span>
      <span>
        A peek at the real {tables.map((t, i) => (
          <Fragment key={t}>{i > 0 && (i === tables.length - 1 ? ' and ' : ', ')}<code>{t}</code></Fragment>
        ))} {tables.length === 1 ? 'table' : 'tables'} — the exercises run against exactly this data.
      </span>
    </div>
  );
}


function SqlExercises({exercise}: {exercise: ExerciseModel}) {
  const currentExIndex = useAppSelector(state => state.exercises.currentExercise);
  const currentEx = exercise.exercises.find(ex => ex.id === currentExIndex);
  const entities = useAppSelector(state => state.exercises.entities);
  const scores = useAppSelector(state => state.exercises.scores);
  const you = useAppSelector(state => state.exercises.userName);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!currentEx) {
    const games = dashboardSummary(entities, scores, you).games;
    const done = games.find(g => g.id === exercise.id);
    const next = nextGame(games, exercise.id);
    const go = (key: 'home' | ExerciseId) => {
      dispatch(fetchData(key));
      navigate(key === 'home' ? '/' : `/${key}`);
    };
    return (
      <div className="df-alldone">
        <div className="df-alldone-head">
          <h2>{next ? '🎉' : '👑'} {datasets[exercise.id].title} complete</h2>
          {done && <>
            <Badge bg="primary">{done.solved}/{done.total}</Badge>
            <Badge bg="primary">{done.points} pts</Badge>
          </>}
        </div>
        {next ? (
          <>
            <div className="df-eyebrow df-alldone-label">Up next</div>
            <div className="df-alldone-poster"><GamePoster game={next} /></div>
            <Button variant="success" className="df-alldone-cta" onClick={() => go(next.id)}>
              Continue with {datasets[next.id].title} →
            </Button>
          </>
        ) : (
          <>
            <div className="df-eyebrow df-alldone-label">That was the last playground</div>
            <Button variant="success" className="df-alldone-cta" onClick={() => go('home')}>
              Back to dashboard
            </Button>
          </>
        )}
      </div>
    )
  }

  return <SqlExercise key={currentEx.id} exercise={exercise} sql={currentEx} />
}


function SqlExercise({exercise, sql}: {exercise: ExerciseModel, sql: SqlExerciseModel}) {
  const currentGame = useAppSelector(state => state.exercises.selected);
  const [sqlText, setSqlTextState] = useState(() => loadDraft(localStorage, currentGame ?? '', sql.id));
  const setSqlText = (text: string) => {
    setSqlTextState(text);
    saveDraft(localStorage, currentGame ?? '', sql.id, text);
  };
  const [error, setError] = useState('');
  const [result, setResult] = useState<null | Record<string, unknown>[]>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [expected, setExpected] = useState<ExpectedModel | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState(false);
  const [cost, setCost] = useState<number | null>(null);
  const [resultTab, setResultTab] = useState<'result' | 'expected' | 'sample' | 'diagram'>('result');
  const [leftTab, setLeftTab] = useState<'exercises' | 'schema'>('exercises');
  const narrow = useMediaQuery('(max-width: 1100px)');
  const registeredName = useAppSelector(state => state.exercises.userName);
  const scores = useAppSelector(state => state.exercises.scores);
  const myScores = scores.filter(score => score.player === registeredName && score.game === currentGame);
  const solvedIds = new Set(myScores.map(score => score.exerciseid));
  const solved = solvedIds.has(sql.id);
  const gaveUpIds = new Set(useAppSelector(state => state.exercises.gaveUp)
    .filter(g => g.game === currentGame)
    .map(g => g.exerciseId));
  const gaveUp = gaveUpIds.has(sql.id);
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const scoredPoints = points ?? myScores.find(score => score.exerciseid === sql.id)?.points ?? sql.points;
  const [origin, setOrigin] = useState(() => Date.now());
  const [details, setDetails] = useState<ExerciseDetails | null>(null);
  const [startError, setStartError] = useState('');
  const dispatch = useAppDispatch();

  useEffect(() => {
    const startExercise = async () => {
      try {
        const res = await authFetch(`${config.api}/game/start`, {
          method: 'POST',
          body: JSON.stringify({ game: currentGame, exerciseId: sql.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStartError(data?.message ?? res.statusText);
          return;
        }
        if (typeof data?.elapsed === 'number') setOrigin(originFromElapsed(data.elapsed, Date.now()));
        setDetails(data.exercise);
      } catch (err) {
        console.error('Could not start timer for exercise', err);
      }
    }

    startExercise();
  }, [sql, currentGame])

  useEffect(() => {
    const game = currentGame ?? '';
    const restoreHelp = async () => {
      try {
        const res = await authFetch(`${config.api}/game/me`);
        if (!res.ok) return;
        const data: {activity: ActivityRow[]} = await res.json();
        const activity = findActivity(data.activity, game, sql.id);
        setAttempts(activity.attempts);
        if (activity.hint) {
          const help = await fetchHelp(game, sql.id, 'hint');
          if (help.ok) setHint(help.data.hints);
        }
        if (activity.expected) {
          const help = await fetchHelp(game, sql.id, 'expected');
          if (help.ok) setExpected(help.data);
        }
      } catch (err) {
        console.error('Could not restore used help', err);
      }
    }

    restoreHelp();
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

      const res = await authFetch(`${config.api}/game/check`, {
        method: 'POST',
        body: JSON.stringify({
          game: currentGame,
          exerciseId: sql.id,
          solution: sqlText,
          telemetry: telemetrySnapshot(currentGame ?? '', sql.id),
        }),
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

  const giveUp = async () => {
    setConfirmGiveUp(false);
    try {
      const res = await authFetch(`${config.api}/game/giveup`, {
        method: 'POST',
        body: JSON.stringify({ game: currentGame, exerciseId: sql.id }),
      });
      if (!res.ok) {
        setError((await res.json()).message ?? 'Could not give up');
        return;
      }
      reset();
      dispatch({type: 'exercises/giveUp', payload: {game: currentGame, exerciseId: sql.id}});
    } catch (err) {
      console.error('Could not give up', err);
      setError('Could not give up');
    }
  };

  const requestHelp = async (type: HelpType) => {
    try {
      const help = await fetchHelp(currentGame ?? '', sql.id, type);
      if (!help.ok) {
        setError(help.data.message ?? 'Could not fetch the hint');
        return;
      }
      if (type === 'hint') {
        setHint(help.data.hints);
      } else {
        setExpected(help.data);
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
          const state = solvedIds.has(ex.id) ? 'df-ex-solved' : gaveUpIds.has(ex.id) ? 'df-ex-gaveup' : 'df-ex-todo';
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

      <section className="df-excard" data-tour="question">
        <div className="df-excard-head">
          <h2 className="df-excard-title">Exercise {sql.id}</h2>
          <PointsBadge sql={sql} hintUsed={hint !== null} expectedUsed={expected !== null} attempts={attempts} />
        </div>
        <p className="df-excard-desc">{details?.desc ?? (startError || 'Loading…')}</p>
        {details && details.expectedColumns.length > 0 && (
          <div className="df-excard-cols" data-tour="columns">
            <div className="df-eyebrow df-excard-colslabel">Expected columns</div>
            <div className="df-chips">
              {details.expectedColumns.map(col => <code key={col} className="df-chip">{col}</code>)}
            </div>
            <div className="df-excard-order">{details.expectedOrder ? 'Order matters' : 'Any order'}</div>
          </div>
        )}
      </section>

      {sql.hasHint && (hint ? (
        <section className="df-hint">
          <div className="df-eyebrow">Hint</div>
          <p>{hint}</p>
        </section>
      ) : (
        <button type="button" className="df-reveal" onClick={() => requestHelp('hint')} data-tour="hint">
          <span>💡 Reveal hint</span>
          <span className="df-cost">−{sql.hintCost} pt</span>
        </button>
      ))}

      <div className="df-panel-nav">
        {!solved && !gaveUp && !success && (
          <Button variant="outline-danger" onClick={() => setConfirmGiveUp(true)} style={{flex: 1}} data-tour="giveup">
            🏳 Give up
          </Button>
        )}
        <Button variant="secondary" onClick={() => {reset(); dispatch({type: 'exercises/nextQuestion'})}} style={{flex: 1}}>
          {solved || gaveUp || success ? 'Next' : 'Skip'}
        </Button>
      </div>

      <Modal show={confirmGiveUp} onHide={() => setConfirmGiveUp(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🏳 Give up on exercise {sql.id}?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You'll see the reference solution and the current fastest, shortest and leanest queries.</p>
          <p className="df-giveup-warning">You won't be able to score on this exercise any more.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmGiveUp(false)}>Keep trying</Button>
          <Button variant="danger" onClick={giveUp}>Give up</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  const solutions = (
    <SolutionsPanel game={currentGame ?? ''} exerciseId={sql.id} solved={solved} points={scoredPoints} maxPoints={sql.points} />
  );

  if ((solved || gaveUp) && !success) {
    return (
      <div className="df-ide">
        <aside className="df-ide-left">{exercisesPanel}</aside>
        <section className="df-ide-main">
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          {solved
            ? <ExerciseSolved reset={reset} text="Greato success, you've already solved this one!" />
            : <ExerciseSolved reset={reset} variant="secondary" emoji="🏳" text="You gave up on this one, no points" />}
          {solutions}
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
            <button type="button" role="tab" aria-selected={leftTab === 'schema'} onClick={() => setLeftTab('schema')} data-tour="schema-tab">Schema</button>
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
          <>
            <ExerciseSolved reset={reset} cost={cost} />
            {solutions}
          </>
        ) : (
          <>
            <div className="df-editor" data-tour="editor">
              <div className="df-editor-head">
                {currentGame === 'Worldcup'
                  ? <span className="df-editor-dialect df-dialect-mssql" title="SQL Server" aria-label="SQL Server"><SqlServerIcon /></span>
                  : <span className="df-editor-dialect df-dialect-pg" title="PostgreSQL" aria-label="PostgreSQL"><PostgresIcon /></span>}
                <QuestionTimer origin={origin} />
                <Button variant="primary" onClick={handleFetch} disabled={!sqlText.length} className="df-editor-submit" data-tour="submit">
                  Submit<span className="df-shortcut">&nbsp;&nbsp;⌘↵</span>
                </Button>
              </div>
              <SqlEditor
                game={currentGame ?? ''}
                exerciseId={sql.id}
                value={sqlText}
                onChange={setSqlText}
                onSubmit={() => { if (sqlText.trim().length && !success) handleFetch(); }}
              />
            </div>

            <div className="df-results">
              <div className="df-rtabs" role="tablist">
                <button type="button" role="tab" aria-selected={resultTab === 'result'} onClick={() => setResultTab('result')} data-tour="result-tab"><span className="df-label-long">Your result</span><span className="df-label-short">Result</span></button>
                <button type="button" role="tab" aria-selected={resultTab === 'expected'} onClick={() => setResultTab('expected')} data-tour="expected-tab">
                  {expected ? 'Expected' : '🔒 Expected'}
                </button>
                <button type="button" role="tab" aria-selected={resultTab === 'sample'} onClick={() => setResultTab('sample')} data-tour="sample-tab"><span className="df-label-long">Sample data</span><span className="df-label-short">Sample</span></button>
                <button type="button" role="tab" aria-selected={resultTab === 'diagram'} onClick={() => setResultTab('diagram')}>Diagram</button>
              </div>
              <div className="df-results-body">
                {resultTab === 'result' && (
                  !result
                    ? <p className="df-results-empty">Run your query to see your result here.</p>
                    : expected
                      ? <ResultDiffTable result={result} expected={expected} expectedOrder={details?.expectedOrder ?? false} />
                      : <ExercisesData data={result} />
                )}
                {resultTab === 'expected' && (
                  expected
                    ? <ExercisesData data={expectedRows(expected)} />
                    : <RevealExpected cost={sql.expectedCost} onReveal={() => requestHelp('expected')} />
                )}
                {resultTab === 'sample' && (
                  <>
                    <SampleQuery query={exercise.sampleQuery} game={exercise.id} className="df-sample-query" />
                    <ExerciseSampleData />
                  </>
                )}
                {resultTab === 'diagram' && <SchemaDiagram game={currentGame ?? ''} />}
              </div>
            </div>
          </>
        )}
      </section>

      {!narrow && <aside className="df-ide-schema" data-tour="schema">{<SchemaPanel game={currentGame ?? ''} sqlText={sqlText} />}</aside>}
    </div>
  )
}


type HelpType = 'hint' | 'expected';

async function fetchHelp(game: string, exerciseId: number, type: HelpType) {
  const res = await authFetch(`${config.api}/game/hint`, {
    method: 'POST',
    body: JSON.stringify({ game, exerciseId, type }),
  });
  return { ok: res.ok, data: await res.json() };
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
      <Button variant="primary" onClick={onReveal} data-tour="reveal-expected">
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


function ExerciseSolved({reset, text, cost, variant = 'success', emoji: fixedEmoji}: {reset: () => void, text?: string, cost?: number | null, variant?: 'success' | 'secondary', emoji?: string}) {
  const [emoji] = useState(() => fixedEmoji ?? emojis[Math.floor(Math.random() * emojis.length)]);
  const dispatch = useAppDispatch();

  return (
    <Alert variant={variant}>
      <Alert.Heading>
        {emoji}
        &nbsp;{text ?? 'Greato success'}
      </Alert.Heading>
      <Button variant={variant} onClick={() => {reset(); dispatch({type: 'exercises/nextQuestion'})}} className="float-end">
        Next Question
      </Button>
      <div className="float-none" style={{marginBottom: 8}}>
        {typeof cost === 'number' && <>Your query read {cost} page{cost === 1 ? '' : 's'}.</>}
      </div>
    </Alert>
  )
}


function ExerciseMeta({exercise}: {exercise: ExerciseModel}) {
  const totalPoints = exercise.exercises.reduce((pts, ex) => ex.points + pts, 0);
  const ds = datasets[exercise.id];

  return (
    <div className="df-intro-meta">
      <span className={`df-pill df-pill-${ds.level}`}>{ds.level}</span>
      <span className="df-pill">
        {ds.db === 'SQL Server'
          ? <span className="df-dialect-mssql"><SqlServerIcon size={14} /></span>
          : <span className="df-dialect-pg"><PostgresIcon size={14} /></span>}
        {ds.db}
      </span>
      <span className="df-pill">{exercise.exercises.length} exercises</span>
      <span className="df-pill df-pill-points">{totalPoints} pts</span>
    </div>
  )
}
