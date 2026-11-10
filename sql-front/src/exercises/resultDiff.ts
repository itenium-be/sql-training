import { ExpectedModel } from './exerciseModels';

export type ColumnStatus = 'match' | 'extra' | 'missing';
export type RowStatus = 'match' | 'wrong' | 'extra' | 'missing';

export type DiffColumn = { name: string; status: ColumnStatus };
export type DiffCell = { value: unknown; expected?: unknown; status: 'match' | 'wrong' };
export type DiffRow = { status: RowStatus; cells: DiffCell[]; belongsAt?: number };

export type DiffSummary = {
  wrongValues: number;
  extraRows: number;
  missingRows: number;
  extraColumns: number;
  missingColumns: number;
  matchedRows: number;
  expectedRows: number;
};

export type ResultDiff = {
  columns: DiffColumn[];
  columnOrderMismatch: boolean;
  orderChecked: boolean;
  rows: DiffRow[];
  summary: DiffSummary;
};

/** Mirrors the server's cellEquals so the diff never contradicts the grader. */
function cellEquals(actual: unknown, expected: unknown): boolean {
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return (actual ?? null) === (expected ?? null);
  }
  const actualText = String(actual);
  if (actualText === String(expected)) {
    return true;
  }
  return typeof expected === 'number' && actualText.trim() !== '' && Number(actualText) === expected;
}

type Slot = {
  kind: RowStatus;
  row: Record<string, unknown>;
  expectedRow?: unknown[];
  belongsAt?: number;
};

type RowEquals = (row: Record<string, unknown>, exp: unknown[]) => boolean;

function unorderedSlots(
  actual: Record<string, unknown>[],
  expectedRows: unknown[][],
  used: boolean[],
  rowEquals: RowEquals,
  similarity: (row: Record<string, unknown>, exp: unknown[]) => number,
): Slot[] {
  const slots: Slot[] = [];
  const leftover: number[] = [];

  actual.forEach(row => {
    const ei = expectedRows.findIndex((exp, i) => !used[i] && rowEquals(row, exp));
    if (ei === -1) {
      slots.push({ kind: 'extra', row });
      leftover.push(slots.length - 1);
    } else {
      used[ei] = true;
      slots.push({ kind: 'match', row, expectedRow: expectedRows[ei] });
    }
  });

  for (const si of leftover) {
    const slot = slots[si];
    let best = -1;
    let bestScore = 0;
    expectedRows.forEach((exp, ei) => {
      if (used[ei]) return;
      const score = similarity(slot.row, exp);
      if (score > bestScore) {
        bestScore = score;
        best = ei;
      }
    });
    if (best !== -1) {
      used[best] = true;
      slot.kind = 'wrong';
      slot.expectedRow = expectedRows[best];
    }
  }

  return slots;
}

function orderedSlots(
  actual: Record<string, unknown>[],
  expectedRows: unknown[][],
  used: boolean[],
  rowEquals: RowEquals,
): Slot[] {
  return actual.map((row, i) => {
    if (i < expectedRows.length && !used[i] && rowEquals(row, expectedRows[i])) {
      used[i] = true;
      return { kind: 'match', row, expectedRow: expectedRows[i] };
    }
    const elsewhere = expectedRows.findIndex((exp, j) => !used[j] && rowEquals(row, exp));
    if (elsewhere !== -1) {
      used[elsewhere] = true;
      return { kind: 'wrong', row, expectedRow: expectedRows[elsewhere], belongsAt: elsewhere + 1 };
    }
    if (i < expectedRows.length) {
      used[i] = true;
      return { kind: 'wrong', row, expectedRow: expectedRows[i] };
    }
    return { kind: 'extra', row };
  });
}

type Layout = {
  columns: DiffColumn[];
  columnOrderMismatch: boolean;
  /** Expected-array index each display column maps to, or -1 for an extra column. */
  expectedIndex: number[];
  /** Expected-array indices of the columns shared by both, in expected order. */
  commonExpectedIndices: number[];
};

function layoutColumns(actualColumns: string[], expectedColumns: string[]): Layout {
  const actualSet = new Set(actualColumns);

  const columns: DiffColumn[] = [];
  const expectedIndex: number[] = [];
  for (const name of actualColumns) {
    const idx = expectedColumns.indexOf(name);
    columns.push({ name, status: idx === -1 ? 'extra' : 'match' });
    expectedIndex.push(idx);
  }
  expectedColumns.forEach((name, idx) => {
    if (!actualSet.has(name)) {
      columns.push({ name, status: 'missing' });
      expectedIndex.push(idx);
    }
  });

  const sameSet =
    actualColumns.length === expectedColumns.length && expectedColumns.every(name => actualSet.has(name));
  const columnOrderMismatch = sameSet && actualColumns.some((name, i) => name !== expectedColumns[i]);

  const commonExpectedIndices = expectedColumns
    .map((name, idx) => (actualSet.has(name) ? idx : -1))
    .filter(idx => idx !== -1);

  return { columns, columnOrderMismatch, expectedIndex, commonExpectedIndices };
}

export function diffResult(
  actual: Record<string, unknown>[],
  expected: ExpectedModel,
  { expectedOrder }: { expectedOrder: boolean },
): ResultDiff {
  const actualColumns = actual.length ? Object.keys(actual[0]) : expected.expectedColumns;
  const { columns, columnOrderMismatch, expectedIndex, commonExpectedIndices } = layoutColumns(
    actualColumns,
    expected.expectedColumns,
  );
  const expectedRows = expected.expected;

  // Row equality compares only the columns both sides have, by expected-array index.
  const rowEquals = (row: Record<string, unknown>, exp: unknown[]) =>
    commonExpectedIndices.every(ei => cellEquals(row[expected.expectedColumns[ei]], exp[ei]));
  const similarity = (row: Record<string, unknown>, exp: unknown[]) =>
    commonExpectedIndices.filter(ei => cellEquals(row[expected.expectedColumns[ei]], exp[ei])).length;

  const used = new Array(expectedRows.length).fill(false);
  type Slot = { kind: RowStatus; row: Record<string, unknown>; expectedRow?: unknown[]; belongsAt?: number };
  const slots: Slot[] = expectedOrder
    ? orderedSlots(actual, expectedRows, used, rowEquals)
    : unorderedSlots(actual, expectedRows, used, rowEquals, similarity);

  const cellFor = (
    column: DiffColumn,
    ei: number,
    kind: RowStatus,
    row: Record<string, unknown> | undefined,
    exp: unknown[] | undefined,
  ): DiffCell => {
    if (column.status === 'missing') {
      return { value: exp ? exp[ei] : undefined, expected: exp ? exp[ei] : undefined, status: 'match' };
    }
    const value = row ? row[column.name] : undefined;
    if (kind === 'wrong' && exp && ei !== -1 && !cellEquals(value, exp[ei])) {
      return { value, expected: exp[ei], status: 'wrong' };
    }
    return { value, status: 'match' };
  };

  const rows: DiffRow[] = slots.map(slot => ({
    status: slot.kind,
    belongsAt: slot.belongsAt,
    cells: columns.map((col, i) => cellFor(col, expectedIndex[i], slot.kind, slot.row, slot.expectedRow)),
  }));

  // Missing rows appended at the bottom.
  expectedRows.forEach((exp, i) => {
    if (used[i]) return;
    rows.push({
      status: 'missing',
      cells: columns.map((col, idx) => {
        const ei = expectedIndex[idx];
        return { value: ei === -1 ? undefined : exp[ei], status: 'match' };
      }),
    });
  });

  const wrongValues = rows.reduce((n, r) => n + r.cells.filter(c => c.status === 'wrong').length, 0);
  const summary: DiffSummary = {
    wrongValues,
    extraRows: rows.filter(r => r.status === 'extra').length,
    missingRows: rows.filter(r => r.status === 'missing').length,
    extraColumns: columns.filter(c => c.status === 'extra').length,
    missingColumns: columns.filter(c => c.status === 'missing').length,
    matchedRows: rows.filter(r => r.status === 'match').length,
    expectedRows: expectedRows.length,
  };

  return { columns, columnOrderMismatch, orderChecked: expectedOrder, rows, summary };
}
