export type Target = { anchor?: string; narrowAnchor?: string };

export type TourEvent = 'next' | 'back' | 'pause' | 'resume' | 'skip';

export type TourState = {
  index: number;
  paused: boolean;
  ended: boolean;
  /** Reached by going back: the demo was reset and the earlier steps must be replayed first. */
  direction: 'next' | 'back';
};

export const initialTour: TourState = { index: 0, paused: false, ended: false, direction: 'next' };

export function tour(state: TourState, event: TourEvent, count: number): TourState {
  switch (event) {
    case 'back':
      return state.index > 0 ? { ...state, index: state.index - 1, direction: 'back' } : state;
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

export function readMs(caption: string): number {
  return Math.max(2500, caption.length * 60);
}
