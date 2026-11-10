import { describe, expect, test } from 'bun:test';
import { diffResult } from './resultDiff';
import { ExpectedModel } from './exerciseModels';

const expected = (columns: string[], rows: unknown[][]): ExpectedModel => ({
  expectedColumns: columns,
  expected: rows,
});

describe('diffResult — unordered rows', () => {
  const exp = expected(['name', 'population'], [
    ['France', 59225700],
    ['Germany', 82164700],
  ]);

  test('all rows correct: every row and column matches', () => {
    const actual = [
      { name: 'France', population: 59225700 },
      { name: 'Germany', population: 82164700 },
    ];
    const diff = diffResult(actual, exp, { expectedOrder: false });

    expect(diff.columns.map(c => c.status)).toEqual(['match', 'match']);
    expect(diff.rows.map(r => r.status)).toEqual(['match', 'match']);
    expect(diff.summary).toMatchObject({ wrongValues: 0, extraRows: 0, missingRows: 0 });
  });

  test('order does not matter: rows matched regardless of position', () => {
    const actual = [
      { name: 'Germany', population: 82164700 },
      { name: 'France', population: 59225700 },
    ];
    const diff = diffResult(actual, exp, { expectedOrder: false });
    expect(diff.rows.map(r => r.status)).toEqual(['match', 'match']);
    expect(diff.summary.wrongValues).toBe(0);
  });

  test('wrong value: row kept, offending cell flagged with expected value', () => {
    const actual = [
      { name: 'France', population: 59225700 },
      { name: 'Germany', population: 999 },
    ];
    const diff = diffResult(actual, exp, { expectedOrder: false });

    const germany = diff.rows.find(r => r.cells[0].value === 'Germany')!;
    expect(germany.status).toBe('wrong');
    expect(germany.cells[1]).toMatchObject({ value: 999, status: 'wrong', expected: 82164700 });
    expect(diff.summary.wrongValues).toBe(1);
  });

  test('extra row: present in result, not expected', () => {
    const actual = [
      { name: 'France', population: 59225700 },
      { name: 'Germany', population: 82164700 },
      { name: 'Turkey', population: 66591000 },
    ];
    const diff = diffResult(actual, exp, { expectedOrder: false });

    const turkey = diff.rows.find(r => r.cells[0].value === 'Turkey')!;
    expect(turkey.status).toBe('extra');
    expect(diff.summary.extraRows).toBe(1);
  });

  test('missing row: expected but absent, appended at the bottom', () => {
    const actual = [{ name: 'France', population: 59225700 }];
    const diff = diffResult(actual, exp, { expectedOrder: false });

    const last = diff.rows[diff.rows.length - 1];
    expect(last.status).toBe('missing');
    expect(last.cells.map(c => c.value)).toEqual(['Germany', 82164700]);
    expect(diff.summary.missingRows).toBe(1);
  });

  test('cell equality mirrors the grader: "5" equals 5', () => {
    const exp5 = expected(['n'], [[5]]);
    const diff = diffResult([{ n: '5' }], exp5, { expectedOrder: false });
    expect(diff.rows[0].status).toBe('match');
  });
});

describe('diffResult — columns', () => {
  test('extra column: flagged once, rows still match on the shared columns', () => {
    const exp = expected(['name', 'population'], [['France', 59225700]]);
    const diff = diffResult([{ name: 'France', continent: 'Europe', population: 59225700 }], exp, { expectedOrder: false });

    const continent = diff.columns.find(c => c.name === 'continent')!;
    expect(continent.status).toBe('extra');
    expect(diff.summary.extraColumns).toBe(1);
    expect(diff.rows[0].status).toBe('match');
  });

  test('missing column: ghost column appended with the expected values', () => {
    const exp = expected(['name', 'population'], [['France', 59225700]]);
    const diff = diffResult([{ name: 'France' }], exp, { expectedOrder: false });

    expect(diff.columns.map(c => ({ name: c.name, status: c.status }))).toEqual([
      { name: 'name', status: 'match' },
      { name: 'population', status: 'missing' },
    ]);
    expect(diff.summary.missingColumns).toBe(1);
    const popCell = diff.rows[0].cells[1];
    expect(popCell.value).toBe(59225700);
  });

  test('columns in a different order: headers flagged, values still match', () => {
    const exp = expected(['name', 'population'], [['France', 59225700]]);
    const diff = diffResult([{ population: 59225700, name: 'France' }], exp, { expectedOrder: false });

    expect(diff.columnOrderMismatch).toBe(true);
    expect(diff.columns.map(c => c.name)).toEqual(['population', 'name']);
    expect(diff.columns.every(c => c.status === 'match')).toBe(true);
    expect(diff.rows[0].status).toBe('match');
  });
});

describe('diffResult — ordered rows', () => {
  const exp = expected(['name'], [['France'], ['Germany'], ['Russia']]);

  test('right rows in the wrong place: each flagged with where it belongs', () => {
    const actual = [{ name: 'France' }, { name: 'Russia' }, { name: 'Germany' }];
    const diff = diffResult(actual, exp, { expectedOrder: true });

    expect(diff.rows.map(r => r.status)).toEqual(['match', 'wrong', 'wrong']);
    expect(diff.rows[1].belongsAt).toBe(3);
    expect(diff.rows[2].belongsAt).toBe(2);
    expect(diff.summary.missingRows).toBe(0);
  });

  test('wrong value at a position: cell flagged, no belongsAt', () => {
    const actual = [{ name: 'France' }, { name: 'Belgium' }, { name: 'Russia' }];
    const diff = diffResult(actual, exp, { expectedOrder: true });

    expect(diff.rows[1].status).toBe('wrong');
    expect(diff.rows[1].belongsAt).toBeUndefined();
    expect(diff.rows[1].cells[0]).toMatchObject({ value: 'Belgium', expected: 'Germany', status: 'wrong' });
  });

  test('unordered exercise never reports a belongsAt', () => {
    const diff = diffResult([{ name: 'Russia' }, { name: 'France' }, { name: 'Germany' }], exp, { expectedOrder: false });
    expect(diff.rows.every(r => r.belongsAt === undefined)).toBe(true);
    expect(diff.rows.every(r => r.status === 'match')).toBe(true);
  });
});
