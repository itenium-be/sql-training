import { useState } from 'react';
import { config, TOKEN_STORAGE } from './config';
import { useAppDispatch } from './store';

export function useRegister() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');
  const dispatch = useAppDispatch();

  const register = async () => {
    if (!name.trim()) {
      return;
    }
    try {
      const res = await fetch(`${config.leaderboard.api}/game/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      setResponse(data.message);
      if (res.status === 200) {
        const registered = data.name ?? name.trim();
        localStorage.setItem(TOKEN_STORAGE, data.token);
        localStorage.setItem('userName', registered);
        dispatch({ type: 'exercises/register', payload: registered });
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse(error instanceof Error ? error.message : String(error));
    }
  };

  return { name, setName, response, register };
}
