import { describe, expect, test } from 'bun:test';
import { podiumBadges } from './podiumBadges';
import { PlayerRow } from '../leaderboard/leaderboardData';

const row: PlayerRow = {
  name: 'alice', points: 0, solved: 12, totalExercises: 32, fastest: 3, shortest: 1, leanest: 0, total: 0, disqualified: false,
};

describe('podiumBadges', () => {
  test('labels each badge with what it counts', () => {
    expect(podiumBadges(row)).toEqual([
      { kind: 'solved', value: 12, text: '12/32', tip: 'Solved 12 of 32 exercises' },
      { kind: 'fastest', value: 3, text: '3', tip: 'Fastest solve on 3 exercises' },
      { kind: 'shortest', value: 1, text: '1', tip: 'Shortest query on 1 exercise' },
      { kind: 'leanest', value: 0, text: '0', tip: 'Fewest reads on 0 exercises' },
    ]);
  });
});
