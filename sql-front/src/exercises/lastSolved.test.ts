import { describe, expect, test } from 'bun:test';
import { lastSolvedQuestion } from './lastSolved';
import { Score } from './exerciseModels';

const score = (player: string, game: string, exerciseid: number): Score => ({
  player, game, exerciseid,
  solutionlength: 0, elapsed: 0, cost: null, points: null, hint: false, expected: false, attempts: 0,
});

describe('lastSolvedQuestion', () => {
  const scores = [
    score('wouter', 'World', 1),
    score('wouter', 'World', 3),
    score('wouter', 'Teachers', 2),
    score('bob', 'World', 5),
  ];

  test('returns the highest solved id for the player and game', () => {
    expect(lastSolvedQuestion(scores, 'wouter', 'World')).toBe(3);
  });

  test('ignores other players and other games', () => {
    expect(lastSolvedQuestion(scores, 'wouter', 'Teachers')).toBe(2);
  });

  test('returns 0 when the player has solved nothing in the game', () => {
    expect(lastSolvedQuestion(scores, 'wouter', 'Worldcup')).toBe(0);
  });
});
