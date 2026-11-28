export type Target = { anchor?: string; narrowAnchor?: string };

export type TourEvent = 'next' | 'pause' | 'resume' | 'skip' | { back: number };

export type TourState = {
  index: number;
  paused: boolean;
  ended: boolean;
  /** Reached by going back: the step's actions are not replayed. */
  direction: 'next' | 'back';
};

export const initialTour: TourState = { index: 0, paused: false, ended: false, direction: 'next' };

export function tour(state: TourState, event: TourEvent, count: number): TourState {
  if (typeof event === 'object') {
    return { ...state, index: event.back, direction: 'back' };
  }
  switch (event) {
    case 'pause':
      return { ...state, paused: true };
    case 'resume':
      return { ...state, paused: false };
    case 'skip':
      return { ...state, ended: true };
    case 'next':
      return state.index < count - 1
        ? { ...state, index: state.index + 1, direction: 'next' }
        : { ...state, ended: true };
  }
}

export function anchorFor(target: Target, narrow: boolean): string | undefined {
  return (narrow && target.narrowAnchor) || target.anchor;
}

export function playable(target: Target, narrow: boolean, exists: (anchor: string) => boolean): boolean {
  const anchor = anchorFor(target, narrow);
  return anchor === undefined || exists(anchor);
}

/** Back only goes to a step on the current screen: its actions are not replayed. */
export function previousPlayable(steps: Target[], from: number, narrow: boolean, exists: (anchor: string) => boolean): number | null {
  for (let i = from - 1; i >= 0; i--) {
    if (steps[i].anchor && playable(steps[i], narrow, exists)) return i;
  }
  return null;
}

export function readMs(caption: string): number {
  return Math.max(2500, caption.length * 60);
}
