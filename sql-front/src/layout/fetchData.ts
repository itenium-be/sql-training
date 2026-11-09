import { AppDispatch } from '../store';
import { config } from '../config';
import { ExerciseId } from '../exercises/exerciseModels';

export const loadScores = () => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${config.leaderboard.api}/game`, {
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

export const fetchData = (key: 'home' | ExerciseId) => async (dispatch: AppDispatch) => {
  await dispatch(loadScores());

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
