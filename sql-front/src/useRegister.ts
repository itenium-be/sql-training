import { useState } from 'react';
import { config, TOKEN_STORAGE } from './config';
import { interpretRegister } from './registerResponse';
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
      const res = await fetch(`${config.api}/game/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const outcome = interpretRegister(res.status, await res.text(), name);
      setResponse(outcome.message);
      if (outcome.registered) {
        localStorage.setItem(TOKEN_STORAGE, outcome.token);
        localStorage.setItem('userName', outcome.name);
        dispatch({ type: 'exercises/register', payload: outcome.name });
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse("Couldn't reach the game server. Is it running?");
    }
  };

  return { name, setName, response, register };
}
