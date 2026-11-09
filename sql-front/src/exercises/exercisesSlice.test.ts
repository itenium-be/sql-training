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
