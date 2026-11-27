import { useEffect, useState } from 'react';
import { authFetch, config } from '../config';
import { questionKey } from './leaderboardData';

type Opened = { game: string; exerciseId: number; desc?: string };

// While the game runs the definitions hide every question; /game/me reveals the ones you opened.
export function useOpenedQuestions(): Record<string, string | undefined> {
  const [questions, setQuestions] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    authFetch(`${config.api}/game/me`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setQuestions(Object.fromEntries((data.exercises as Opened[]).map(ex => [questionKey(ex.game, ex.exerciseId), ex.desc])));
      })
      .catch(err => console.error('Could not fetch your exercises', err));
  }, []);
  return questions;
}
