import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { loadScores } from './fetchData';

const REFRESH_MS = 5000;

export function useLiveScores() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadScores());
    const timer = setInterval(() => dispatch(loadScores()), REFRESH_MS);
    return () => clearInterval(timer);
  }, [dispatch]);
}
