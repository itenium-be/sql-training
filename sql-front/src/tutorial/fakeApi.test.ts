import { describe, expect, test } from 'bun:test';
import { createFakeApi } from './fakeApi';
import { demoAttempts, demoCorrect, DEMO_EXERCISE, DEMO_GAME, YOU } from './demoData';

const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) });
const ex = { game: DEMO_GAME, exerciseId: DEMO_EXERCISE };
const check = (api: ReturnType<typeof createFakeApi>, solution: string) =>
  api('/api/game/check', post({ ...ex, solution })).body as { correct: boolean; attempts?: number; points?: number };
const wrong = demoAttempts.filter(a => !a.correct);

describe('fakeApi', () => {
  test('a wrong check counts the attempt', () => {
    const api = createFakeApi();
    expect(check(api, wrong[0].sql)).toMatchObject({ correct: false, attempts: 1 });
    expect(check(api, wrong[1].sql)).toMatchObject({ correct: false, attempts: 2 });
  });

  test('every 3rd wrong check lowers the points by 1', () => {
    const api = createFakeApi();
    wrong.forEach(a => check(api, a.sql));
    expect(check(api, demoCorrect).points).toBe(5);
  });

  test('hint and expected each lower the points by 1, once', () => {
    const api = createFakeApi();
    api('/api/game/hint', post({ ...ex, type: 'hint' }));
    api('/api/game/hint', post({ ...ex, type: 'hint' }));
    api('/api/game/hint', post({ ...ex, type: 'expected' }));
    expect(check(api, demoCorrect).points).toBe(4);
  });

  test('the correct query solves the exercise and adds your score', () => {
    const api = createFakeApi();
    expect(check(api, demoCorrect)).toMatchObject({ correct: true, recorded: true, points: 6 });
    const scores = api('/api/game').body as { player: string; game: string; exerciseid: number }[];
    expect(scores.some(s => s.player === YOU && s.game === DEMO_GAME && s.exerciseid === DEMO_EXERCISE)).toBe(true);
  });

  test('an unknown query is wrong', () => {
    expect(check(createFakeApi(), 'SELECT 1')).toMatchObject({ correct: false, attempts: 1 });
  });

  test('your activity reflects the help used', () => {
    const api = createFakeApi();
    check(api, wrong[0].sql);
    api('/api/game/hint', post({ ...ex, type: 'hint' }));
    const me = api('/api/game/me').body as { activity: { attempts: number; hint: boolean; expected: boolean }[] };
    expect(me.activity[0]).toMatchObject({ attempts: 1, hint: true, expected: false });
  });

  test('solutions stay locked until solved', () => {
    const api = createFakeApi();
    const url = `/api/game/solutions?game=${DEMO_GAME}&exerciseId=${DEMO_EXERCISE}`;
    expect(api(url).status).toBe(403);
    check(api, demoCorrect);
    expect(api(url).status).toBe(200);
  });

  test('an /api URL outside its table throws', () => {
    expect(() => createFakeApi()('/api/game/admin/mode', post({}))).toThrow();
  });
});
