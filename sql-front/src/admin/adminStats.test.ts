import { describe, expect, test } from 'bun:test';
import { overviewStats, winningSolutions } from './adminStats';
import type { AdminOverview } from './adminData';
import type { ExerciseAward } from '../leaderboard/leaderboardData';
import type { Score } from '../exercises/exerciseModels';

const NOW = Date.parse('2026-11-10T20:10:00Z');
const ago = (sec: number) => new Date(NOW - sec * 1000).toISOString();

const base: AdminOverview = {
  mode: 'running', modes: ['init', 'running', 'end'],
  players: [], progress: [], solutions: [], starts: [], activity: [], submissions: [],
};

describe('overviewStats', () => {
  test('counts registrations and chosen avatars', () => {
    const o = { ...base, players: [
      { id: 1, name: 'A', avatar: 5 }, { id: 2, name: 'B', avatar: null }, { id: 3, name: 'C', avatar: 2 },
    ]};
    const s = overviewStats(o, NOW, 10);
    expect(s.registered).toBe(3);
    expect(s.avatarsChosen).toBe(2);
  });

  test('active = players who pinged within the idle window; idle is the rest', () => {
    const o = { ...base,
      players: [{ id: 1, name: 'A', avatar: null }, { id: 2, name: 'B', avatar: null }, { id: 3, name: 'C', avatar: null }],
      activity: [
        { player: 'A', game: 'W', exerciseid: 1, attempts: 1, lastactiveat: ago(10) },
        { player: 'B', game: 'W', exerciseid: 1, attempts: 1, lastactiveat: ago(400) },
      ],
    };
    const s = overviewStats(o, NOW, 10);
    expect(s.activeNow).toBe(1);
    expect(s.idle).toBe(2);
  });

  test('submissions per minute counts only the last 60s', () => {
    const o = { ...base, submissions: [
      { id: 1, player: 'A', game: 'W', exerciseid: 1, correct: false, submittedat: ago(10), solution: 'x', message: null },
      { id: 2, player: 'A', game: 'W', exerciseid: 1, correct: false, submittedat: ago(59), solution: 'x', message: null },
      { id: 3, player: 'A', game: 'W', exerciseid: 1, correct: true, submittedat: ago(120), solution: 'x', message: null },
    ]};
    expect(overviewStats(o, NOW, 10).submissionsPerMin).toBe(2);
  });

  test('fully solved = players whose solved count reaches the total', () => {
    const p = (player: string, exerciseid: number): Score => ({ player, game: 'W', exerciseid, solutionlength: 1, elapsed: 1, cost: 1, points: 1, hint: false, expected: false, attempts: 0 });
    const o = { ...base,
      players: [{ id: 1, name: 'A', avatar: null }, { id: 2, name: 'B', avatar: null }],
      progress: [p('A', 1), p('A', 2), p('B', 1)],
    };
    expect(overviewStats(o, NOW, 2).fullySolved).toBe(1);
  });
});

describe('winningSolutions', () => {
  const award: ExerciseAward = {
    game: 'W', exerciseId: 7, desc: 'Top scorer', solvedBy: 2,
    fastest: { player: 'Nora', time: 160 },
    shortest: { player: 'Sam', chars: 95 },
    leanest: null,
  };
  const progress: Score[] = [
    { player: 'Nora', game: 'W', exerciseid: 7, solution: 'NORA SQL', solutionlength: 120, elapsed: 160, cost: 11, points: 90, hint: false, expected: false, attempts: 0 },
    { player: 'Sam', game: 'W', exerciseid: 7, solution: 'SAM SQL', solutionlength: 95, elapsed: 240, cost: 14, points: 80, hint: false, expected: false, attempts: 0 },
  ];

  test('returns a card per present award holder with their solution text', () => {
    const cards = winningSolutions(award, progress);
    expect(cards.map(c => c.tag)).toEqual(['Fastest', 'Shortest']);
    expect(cards[0]).toMatchObject({ tag: 'Fastest', player: 'Nora', solution: 'NORA SQL' });
    expect(cards[1]).toMatchObject({ tag: 'Shortest', player: 'Sam', solution: 'SAM SQL' });
  });

  test('omits an award nobody holds', () => {
    expect(winningSolutions(award, progress).some(c => c.tag === 'Leanest')).toBe(false);
  });
});
