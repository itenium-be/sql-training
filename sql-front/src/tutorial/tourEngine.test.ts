import { describe, expect, test } from 'bun:test';
import { actionsBefore, anchorFor, catchUp, initialTour, playable, tour } from './tourEngine';

const count = 3;
const at = (index: number) => ({ ...initialTour, index });

describe('tour', () => {
  test('next moves one step', () => {
    expect(tour(at(1), 'next', count).index).toBe(2);
  });

  test('back moves to the previous step', () => {
    expect(tour(at(2), 'back', count).index).toBe(1);
  });

  test('back on the first step stays put', () => {
    expect(tour(at(0), 'back', count)).toEqual(at(0));
  });

  test('next on the last step ends the tour', () => {
    expect(tour(at(2), 'next', count).ended).toBe(true);
  });

  test('skip ends the tour', () => {
    expect(tour(at(1), 'skip', count).ended).toBe(true);
  });

  test('a move remembers its direction', () => {
    expect(tour(at(1), 'back', count).direction).toBe('back');
    expect(tour(at(1), 'next', count).direction).toBe('next');
  });
});

describe('anchorFor', () => {
  const target = { anchor: 'schema', narrowAnchor: 'schema-tab' };

  test('on narrow screens the narrow anchor wins', () => {
    expect(anchorFor(target, true)).toBe('schema-tab');
  });

  test('on wide screens the anchor is used', () => {
    expect(anchorFor(target, false)).toBe('schema');
  });

  test('without a narrow anchor narrow screens use the anchor', () => {
    expect(anchorFor({ anchor: 'editor' }, true)).toBe('editor');
  });
});

describe('playable', () => {
  test('a step whose anchor is missing is not playable', () => {
    expect(playable({ anchor: 'gone' }, false, () => false)).toBe(false);
  });

  test('a step without an anchor is always playable', () => {
    expect(playable({}, false, () => false)).toBe(true);
  });

  test('checks the anchor for the current layout', () => {
    expect(playable({ anchor: 'schema', narrowAnchor: 'schema-tab' }, true, a => a === 'schema-tab')).toBe(true);
  });
});

describe('actionsBefore', () => {
  const steps = [{ actions: [1, 2] }, {}, { enter: [3], actions: [4] }, { actions: [5] }];

  test('counts the enter and actions of every earlier step', () => {
    expect(actionsBefore(steps, 0)).toBe(0);
    expect(actionsBefore(steps, 2)).toBe(2);
    expect(actionsBefore(steps, 3)).toBe(4);
  });
});

describe('catchUp', () => {
  test('replays the missing actions on top of the demo', () => {
    expect(catchUp(2, 5)).toEqual({ reset: false, from: 2 });
  });

  test('does nothing when the demo is already there', () => {
    expect(catchUp(3, 3)).toEqual({ reset: false, from: 3 });
  });

  test('resets and replays from the start when the demo is ahead', () => {
    expect(catchUp(5, 2)).toEqual({ reset: true, from: 0 });
  });
});
