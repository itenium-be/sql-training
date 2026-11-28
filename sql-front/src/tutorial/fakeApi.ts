import { Score } from '../exercises/exerciseModels';
import { livePoints } from '../exercises/livePoints';
import {
  demoAttempts, demoCorrect, demoCost, demoDefinitions, demoDetails, demoExpected, demoHint, DEMO_EXERCISE, DEMO_GAME,
  demoOthers, demoPlayers, demoSampleData, demoSchema, demoSolutions, YOU,
} from './demoData';

type FakeResponse = { status: number; body: unknown };
export type FakeApi = (url: string, init?: RequestInit) => FakeResponse;

const ok = (body: unknown): FakeResponse => ({ status: 200, body });
const normalize = (sql: string) => sql.replace(/\s+/g, ' ').trim().toLowerCase();
const length = (sql: string) => sql.replace(/\s+/g, ' ').trim().length;
const demoSql = demoDefinitions[0].exercises.find(e => e.id === DEMO_EXERCISE)!;

/** An in-memory stand-in for the back-end, scoring the demo exercise by the server's rules. */
export function createFakeApi(now: () => number = Date.now): FakeApi {
  let attempts = 0;
  let hint = false;
  let expected = false;
  let gaveUp = false;
  let startedAt: number | null = null;
  let mine: Score | null = null;

  const elapsed = () => startedAt === null ? 0 : Math.round((now() - startedAt) / 1000);
  const scores = () => mine ? [...demoOthers, mine] : demoOthers;

  const check = (solution: string): FakeResponse => {
    const attempt = demoAttempts.find(a => normalize(a.sql) === normalize(solution));
    if (!attempt?.correct) {
      if (!mine) attempts++;
      return ok({ correct: false, message: 'Query result does not match expected output!', rows: attempt?.rows ?? [], attempts });
    }
    if (mine) {
      return ok({ correct: true, recorded: false, message: 'Already solved!', rows: attempt.rows, cost: demoCost });
    }
    const points = livePoints(demoSql, { hintUsed: hint, expectedUsed: expected, attempts });
    mine = { player: YOU, game: DEMO_GAME, exerciseid: DEMO_EXERCISE, solution, solutionlength: length(solution), elapsed: elapsed(), cost: demoCost, points, hint, expected, attempts };
    return ok({ correct: true, recorded: true, message: 'Registered!', rows: attempt.rows, cost: demoCost, points, hint, expected, attempts });
  };

  const routes: Record<string, (body: Record<string, unknown>) => FakeResponse> = {
    'GET /game': () => ok(scores()),
    'GET /game/state': () => ok({ mode: 'running' }),
    'GET /game/players': () => ok(demoPlayers),
    'GET /game/me': () => ok({
      player: YOU,
      activity: [{ game: DEMO_GAME, exerciseid: DEMO_EXERCISE, attempts, hint, expected, gaveup: gaveUp }],
      exercises: [],
    }),
    'GET /exercises/definitions': () => ok({ responseObject: demoDefinitions }),
    'GET /exercises/schema': () => ok({ success: true, responseObject: demoSchema }),
    'POST /exercises/validate': () => ok({ success: true, responseObject: [] }),
    [`GET /${DEMO_GAME}/sampleData`]: () => ok({ responseObject: demoSampleData }),
    'POST /game/start': () => {
      startedAt ??= now();
      return ok({ message: 'Started!', elapsed: elapsed(), exercise: demoDetails });
    },
    'POST /game/activity': () => ok({ ok: true }),
    'POST /game/check': body => check(String(body.solution ?? '')),
    'POST /game/hint': body => {
      if (body.type === 'hint') {
        hint ||= !mine;
        return ok({ hints: demoHint });
      }
      expected ||= !mine;
      return ok({ expected: demoExpected, expectedColumns: demoDetails.expectedColumns });
    },
    'POST /game/giveup': () => {
      gaveUp = true;
      return ok({ ok: true });
    },
    'GET /game/solution': () => mine
      ? ok({ solution: mine.solution, elapsed: mine.elapsed, rows: demoAttempts.find(a => a.correct)!.rows })
      : { status: 404, body: { message: 'Not solved yet' } },
    'GET /game/solutions': () => mine || gaveUp
      ? ok({ reference: { solution: demoCorrect, length: length(demoCorrect), cost: demoCost }, solutions: demoSolutions })
      : { status: 403, body: { message: 'Solve the exercise or give up first' } },
  };

  return (url, init = {}) => {
    const parsed = new URL(url, 'http://tutorial');
    const path = parsed.pathname.replace(/^\/api/, '');
    const key = `${(init.method ?? 'GET').toUpperCase()} ${path}`;
    const route = routes[key];
    if (!route) {
      throw new Error(`Tutorial sandbox has no fake for ${key}`);
    }
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : {};
    return route(body);
  };
}
