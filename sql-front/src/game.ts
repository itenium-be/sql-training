import { useEffect, useState } from 'react';
import { config } from './config';

export type GameMode = 'init' | 'running' | 'end';

export type Player = {
  id: number;
  name: string;
};

export const AVATAR_COUNT = 60;

export function avatarUrl(playerId: number): string {
  const index = ((playerId - 1) % AVATAR_COUNT + AVATAR_COUNT) % AVATAR_COUNT + 1;
  return `/avatars/avatar-${String(index).padStart(2, '0')}.png`;
}

export function usePolling<T>(url: string, intervalMs: number): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(url);
        if (res.ok && !cancelled) {
          setData(await res.json());
        }
      } catch (error) {
        console.error(`Could not fetch ${url}`, error);
      }
    };

    load();
    const timer = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [url, intervalMs]);

  return data;
}

export function useGameMode(): GameMode | null {
  const state = usePolling<{mode: GameMode}>(`${config.leaderboard.api}/game/state`, 3000);
  return state?.mode ?? null;
}

export function usePlayers(): Player[] {
  return usePolling<Player[]>(`${config.leaderboard.api}/game/players`, 3000) ?? [];
}
