import { useState } from "react";
import { ExpectedModel } from "./exerciseModels";
import { diffResult, DiffRow, ResultDiff } from "./resultDiff";
import { formatValue } from "./formatValue";

const EXTRA_ROW_CAP = 20;

export function ResultDiffTable({
  result,
  expected,
  expectedOrder,
}: {
  result: Record<string, unknown>[];
  expected: ExpectedModel;
  expectedOrder: boolean;
}) {
  const diff = diffResult(result, expected, { expectedOrder });
  const [showAllExtras, setShowAllExtras] = useState(false);

  const extraCount = diff.summary.extraRows;
  const capped = extraCount > EXTRA_ROW_CAP && !showAllExtras;
  let shownExtras = 0;
  let hiddenExtras = 0;
  const rows = diff.rows.filter(row => {
    if (row.status !== 'extra') return true;
    shownExtras++;
    if (capped && shownExtras > EXTRA_ROW_CAP) {
      hiddenExtras++;
      return false;
    }
    return true;
  });

  let presentIndex = 0;

  return (
    <div className="df-diff">
      <Badges diff={diff} />

      {diff.columnOrderMismatch && (
        <div className="df-diff-note">
          Expected column order: {expected.expectedColumns.join(', ')}
        </div>
      )}

      <table className="df-diff-table">
        <thead>
          <tr>
            <th className="df-diff-gutter"></th>
            {diff.columns.map(col => (
              <th key={col.name} className={`df-dc-${col.status}`}>
                {col.status === 'extra' ? <s>{col.name}</s> : col.name}
                {col.status === 'extra' && <span className="df-diff-tag">not expected</span>}
                {col.status === 'missing' && <span className="df-diff-tag">missing</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.status === 'match' || row.status === 'wrong') presentIndex++;
            return <Row key={i} row={row} columns={diff.columns} gutter={gutterLabel(row, presentIndex)} />;
          })}
        </tbody>
      </table>

      {hiddenExtras > 0 && (
        <button type="button" className="df-diff-more" onClick={() => setShowAllExtras(true)}>
          Show all {extraCount} extra rows
        </button>
      )}

      <div className="df-diff-legend">
        <span><i className="df-leg df-leg-wrong" /> wrong value, expected shown below</span>
        <span><i className="df-leg df-leg-extra" /> row or column that should not be there</span>
        <span><i className="df-leg df-leg-missing" /> row or column you are missing</span>
      </div>
    </div>
  );
}

function gutterLabel(row: DiffRow, presentIndex: number) {
  if (row.status === 'extra') return <span className="df-diff-rowtag df-rt-extra">extra</span>;
  if (row.status === 'missing') return <span className="df-diff-rowtag df-rt-missing">missing</span>;
  return (
    <>
      <span className="df-diff-rownum">{presentIndex}</span>
      {row.belongsAt !== undefined && (
        <span className="df-diff-belongs">belongs at #{row.belongsAt}</span>
      )}
    </>
  );
}

function Row({ row, columns, gutter }: { row: DiffRow; columns: ResultDiff['columns']; gutter: React.ReactNode }) {
  return (
    <tr className={`df-dr-${row.status}`}>
      <td className="df-diff-gutter">{gutter}</td>
      {row.cells.map((cell, i) => {
        const col = columns[i];
        const blank = cell.value === undefined && col.status !== 'missing';
        const { node, alignRight } = blank ? { node: <span className="df-diff-dash">–</span>, alignRight: false } : formatValue(cell.value);
        const cls = [
          `df-dcell-${col.status}`,
          cell.status === 'wrong' ? 'df-dcell-wrong' : '',
        ].filter(Boolean).join(' ');
        return (
          <td key={i} className={cls} style={alignRight ? { textAlign: 'right' } : undefined}>
            {node}
            {cell.status === 'wrong' && (
              <span className="df-diff-expected">expected {formatValue(cell.expected).node}</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function Badges({ diff }: { diff: ResultDiff }) {
  const s = diff.summary;
  const badges: { text: string; kind: string }[] = [];
  if (s.wrongValues) badges.push({ text: plural(s.wrongValues, 'wrong value'), kind: 'wrong' });
  if (s.extraRows) badges.push({ text: plural(s.extraRows, 'extra row'), kind: 'extra' });
  if (s.missingRows) badges.push({ text: plural(s.missingRows, 'missing row'), kind: 'missing' });
  if (s.extraColumns) badges.push({ text: plural(s.extraColumns, 'extra column'), kind: 'extra' });
  if (s.missingColumns) badges.push({ text: plural(s.missingColumns, 'missing column'), kind: 'missing' });
  badges.push({
    text: diff.orderChecked ? 'Order matters' : 'Any order',
    kind: 'note',
  });

  return (
    <div className="df-diff-badges">
      {badges.map((b, i) => (
        <span key={i} className={`df-diff-badge df-db-${b.kind}`}>{b.text}</span>
      ))}
    </div>
  );
}

function plural(n: number, noun: string) {
  return `${n} ${noun}${n === 1 ? '' : 's'}`;
}
