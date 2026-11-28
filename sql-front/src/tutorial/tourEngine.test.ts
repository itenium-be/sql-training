import { describe, expect, test } from 'bun:test';
import { anchorFor, initialTour, playable, readMs, tour } from './tourEngine';

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

  test('pause and resume toggle without moving', () => {
    const paused = tour(at(1), 'pause', count);
    expect(paused).toMatchObject({ index: 1, paused: true });
    expect(tour(paused, 'resume', count)).toMatchObject({ index: 1, paused: false });
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

describe('readMs', () => {
  test('60ms per character', () => {
    expect(readMs('x'.repeat(100))).toBe(6000);
  });

  test('at least 2.5s', () => {
    expect(readMs('Go!')).toBe(2500);
  });
});
