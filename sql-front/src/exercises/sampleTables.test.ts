import { describe, expect, test } from 'bun:test';
import { sampleTables } from './sampleTables';

describe('sampleTables', () => {
  test('reads the FROM table', () => {
    expect(sampleTables('SELECT id, name FROM countries')).toEqual(['countries']);
  });

  test('reads joined tables across lines, once each, in order', () => {
    const query = `SELECT 1
FROM matches m JOIN teams t1 ON t1.id=m.team1_id JOIN countries c1 ON t1.country_id=c1.id
JOIN teams t2 ON t2.id=m.team2_id join countries c2 ON t2.country_id=c2.id`;
    expect(sampleTables(query)).toEqual(['matches', 'teams', 'countries']);
  });
});

