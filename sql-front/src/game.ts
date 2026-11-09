import { useCallback, useEffect, useState } from 'react';
import { authFetch, config } from './config';
import { AVATAR_COUNT } from './avatars';

export type GameMode = 'init' | 'running' | 'end';

export type Player = {
  id: number;
  name: string;
  avatar: number | null;
};

export function avatarIndex(player: Player): number {
  return player.avatar ?? ((player.id - 1) % AVATAR_COUNT + AVATAR_COUNT) % AVATAR_COUNT + 1;
}

async function fetchJson<T>(url: string): Promise<T | undefined> {
  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error(`Could not fetch ${url}`, error);
  }
  return undefined;
}

const setDefined = <T>(setter: (value: T) => void) => (value: T | undefined) => {
  if (value !== undefined) {
    setter(value);
  }
};

function usePolling<T>(url: string, intervalMs: number): [T | null, () => Promise<void>] {
  const [data, setData] = useState<T | null>(null);

  const load = useCallback(() => fetchJson<T>(url).then(setDefined(setData)), [url]);

  useEffect(() => {
    fetchJson<T>(url).then(setDefined(setData));
    const timer = setInterval(load, intervalMs);
    return () => clearInterval(timer);
  }, [url, load, intervalMs]);

  return [data, load];
}

export function useGameMode(): GameMode | null {
  const [state] = usePolling<{mode: GameMode}>(`${config.leaderboard.api}/game/state`, 3000);
  return state?.mode ?? null;
}

export function usePlayers(): [Player[], () => Promise<void>] {
  const [players, reload] = usePolling<Player[]>(`${config.leaderboard.api}/game/players`, 3000);
  return [players ?? [], reload];
}

export async function saveAvatar(avatar: number): Promise<string | null> {
  const res = await authFetch(`${config.leaderboard.api}/game/avatar`, {
    method: 'POST',
    body: JSON.stringify({ avatar }),
  });
  if (res.ok) {
    return null;
  }
  const data = await res.json();
  return data.message ?? res.statusText;
}
