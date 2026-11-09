import { describe, expect, test } from 'bun:test';
import { columnsUsed } from './schema';

const schema = { countries: ['id', 'name', 'continent', 'area', 'population', 'gdp'] };

describe('columnsUsed', () => {
  test('flags every schema column referenced in the query', () => {
    const used = columnsUsed('SELECT name, gdp / population FROM countries', schema);
    expect([...used].sort()).toEqual(['gdp', 'name', 'population']);
  });

  test('matches case-insensitively', () => {
    expect(columnsUsed('select NAME from countries', schema).has('name')).toBe(true);
  });

  test('matches whole words only, not substrings', () => {
    expect(columnsUsed('select 1 where are_we there', schema).has('area')).toBe(false);
  });

  test('an empty query uses no columns', () => {
    expect(columnsUsed('', schema).size).toBe(0);
  });
});
