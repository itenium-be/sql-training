import { AppDispatch } from '../store';
import { authFetch, config, TOKEN_STORAGE } from '../config';
import { ActivityRow, gaveUpExercises } from '../exercises/myActivity';
import { ExerciseId } from '../exercises/exerciseModels';

export const loadScores = () => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${config.api}/game`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!data.message) {
      dispatch({type: 'exercises/setScores', payload: data});
    }
  } catch (error) {
    console.error('Could not fetch leaderboard', error);
  }
};

const loadGaveUp = () => async (dispatch: AppDispatch) => {
  if (!localStorage.getItem(TOKEN_STORAGE)) {
    return;
  }
  try {
    const res = await authFetch(`${config.api}/game/me`);
    if (!res.ok) return;
    const data: {activity: ActivityRow[]} = await res.json();
    dispatch({type: 'exercises/setGaveUp', payload: gaveUpExercises(data.activity)});
  } catch (error) {
    console.error('Could not fetch your activity', error);
  }
};

export const loadDefinitions = () => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${config.api}/exercises/definitions`);
    const data = await res.json();
    dispatch({type: 'exercises/setEntities', payload: data.responseObject});
  } catch (error) {
    console.error('Could not fetch exercises', error);
  }
};

export const fetchData = (key: 'home' | ExerciseId) => async (dispatch: AppDispatch) => {
  await Promise.all([dispatch(loadScores()), dispatch(loadGaveUp())]);

  if (key === 'home') {
    dispatch({type: 'exercises/switch', payload: {key}});
    return;
  }

  try {
    const res = await fetch(`${config.api}/${key}/sampleData`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    dispatch({type: 'exercises/switch', payload: {key, data: data.responseObject}});
  } catch (error) {
    console.error('Could not fetch sample data', error);
    dispatch({type: 'exercises/switch', payload: {key, data: []}});
  }
};
