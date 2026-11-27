import { describe, expect, test } from 'bun:test';
import reducer from './exercisesSlice';

const initial = reducer(undefined, { type: '@@INIT' });
const inGame = reducer(initial, { type: 'exercises/switch', payload: { key: 'World', data: [] } });

describe('gotoQuestion', () => {
  test('jumps to the given exercise while a game is selected', () => {
    const state = reducer(inGame, { type: 'exercises/gotoQuestion', payload: 3 });
    expect(state.currentExercise).toBe(3);
  });

  test('is ignored when no game is selected', () => {
    const state = reducer(initial, { type: 'exercises/gotoQuestion', payload: 3 });
    expect(state.currentExercise).toBe(0);
  });
});

describe('gaveUp', () => {
  test('switching into a game resumes at the last given-up exercise', () => {
    const withGaveUp = reducer(initial, { type: 'exercises/setGaveUp', payload: [{ game: 'World', exerciseId: 5 }] });
    const state = reducer(withGaveUp, { type: 'exercises/switch', payload: { key: 'World', data: [] } });
    expect(state.currentExercise).toBe(5);
  });

  test('giveUp adds the exercise once', () => {
    const once = reducer(inGame, { type: 'exercises/giveUp', payload: { game: 'World', exerciseId: 2 } });
    const twice = reducer(once, { type: 'exercises/giveUp', payload: { game: 'World', exerciseId: 2 } });
    expect(twice.gaveUp).toEqual([{ game: 'World', exerciseId: 2 }]);
  });
});
