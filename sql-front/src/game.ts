import { useCallback, useEffect, useState } from 'react';
import { authFetch, config } from './config';

export type GameMode = 'init' | 'running' | 'end';

export type Player = {
  id: number;
  name: string;
  avatar: number | null;
};

export const AVATAR_COUNT = 60;

export function avatarIndex(player: Player): number {
  return player.avatar ?? ((player.id - 1) % AVATAR_COUNT + AVATAR_COUNT) % AVATAR_COUNT + 1;
}

export function avatarUrl(index: number): string {
  return `/avatars/avatar-${String(index).padStart(2, '0')}.png`;
}

export function usePolling<T>(url: string, intervalMs: number): [T | null, () => Promise<void>] {
  const [data, setData] = useState<T | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error(`Could not fetch ${url}`, error);
    }
  }, [url]);

  useEffect(() => {
    load();
    const timer = setInterval(load, intervalMs);
    return () => clearInterval(timer);
  }, [load, intervalMs]);

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
