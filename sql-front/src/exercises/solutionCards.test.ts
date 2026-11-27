import { describe, expect, test } from 'bun:test';
import { cardMetrics, playerMetrics, withSolutions } from './solutionCards';
import { Score } from './exerciseModels';

const score = (player: string, game: string, exerciseid: number): Score => ({
  player, game, exerciseid,
  solutionlength: 0, elapsed: 0, cost: null, points: null, hint: false, expected: false, attempts: 0,
});

describe('withSolutions', () => {
  const scores = [score('alice', 'World', 1), score('bob', 'World', 1), score('alice', 'World', 2)];
  const solutions = [{player: 'alice', solution: 'SELECT 1'}, {player: 'bob', solution: 'SELECT 2'}];

  test('fills in the solution text of that exercise', () => {
    const filled = withSolutions(scores, 'World', 1, solutions);
    expect(filled.map(s => s.solution)).toEqual(['SELECT 1', 'SELECT 2', undefined]);
  });

  test('leaves other exercises alone', () => {
    expect(withSolutions(scores, 'World', 1, solutions)[2]).toBe(scores[2]);
  });
});

describe('cardMetrics', () => {
  test('lists time, characters and reads, flagging the awards held', () => {
    const metrics = cardMetrics({elapsed: 133, chars: 34, reads: 11}, ['leanest']);
    expect(metrics.map(m => [m.kind, m.value, m.won])).toEqual([
      ['fastest', '2:13', false],
      ['shortest', '34 ch', false],
      ['leanest', '11 reads', true],
    ]);
  });

  test('omits the time for the reference solution', () => {
    expect(cardMetrics({chars: 40, reads: 3}, []).map(m => m.kind)).toEqual(['shortest', 'leanest']);
  });

  test('omits reads that could not be measured', () => {
    expect(cardMetrics({elapsed: 5, chars: 40, reads: null}, []).map(m => m.kind)).toEqual(['fastest', 'shortest']);
  });

  test('explains a held award in the tooltip', () => {
    const [fastest] = cardMetrics({elapsed: 41, chars: 21, reads: 3}, ['fastest']);
    expect(fastest.tip).toContain('Fastest');
  });
});

describe('playerMetrics', () => {
  test('reads the time, length and reads from the score', () => {
    const s = {...score('alice', 'World', 1), elapsed: 41, solutionlength: 21, cost: 3};
    expect(playerMetrics(s, ['shortest']).map(m => [m.value, m.won])).toEqual([['0:41', false], ['21 ch', true], ['3 reads', false]]);
  });

  test('has nothing to show without a score', () => {
    expect(playerMetrics(undefined, [])).toEqual([]);
  });
});
