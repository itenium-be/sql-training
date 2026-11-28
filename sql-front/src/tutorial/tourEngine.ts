export type Target = { anchor?: string; narrowAnchor?: string };

export type TourEvent = 'next' | 'back' | 'skip';

export type TourState = {
  index: number;
  ended: boolean;
  /** Which way to keep going when a step's anchor is not on screen. */
  direction: 'next' | 'back';
};

export const initialTour: TourState = { index: 0, ended: false, direction: 'next' };

export function tour(state: TourState, event: TourEvent, count: number): TourState {
  switch (event) {
    case 'back':
      return state.index > 0 ? { ...state, index: state.index - 1, direction: 'back' } : state;
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

export function actionsBefore(steps: { actions?: unknown[] }[], index: number): number {
  return steps.slice(0, index).reduce((n, step) => n + (step.actions?.length ?? 0), 0);
}

/** How to bring a demo that has run `applied` actions to exactly `target`: actions only add, so a demo ahead of the target starts over. */
export function catchUp(applied: number, target: number): { reset: boolean; from: number } {
  return applied > target ? { reset: true, from: 0 } : { reset: false, from: applied };
}
