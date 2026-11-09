import type { GameMode } from './game';

export type Screen = 'intro' | 'register' | 'waiting' | 'game';

export function screenFor(mode: GameMode | null, registered: boolean, started: boolean): Screen {
  const live = mode === 'running' || mode === 'end';
  if (registered) {
    return live ? 'game' : 'waiting';
  }
  if (!started) {
    return 'intro';
  }
  return 'register';
}
