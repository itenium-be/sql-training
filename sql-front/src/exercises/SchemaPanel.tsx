import { useEffect, useMemo, useState } from "react";
import { columnsUsed, SqlSchema } from "./schema";
import { loadSchema } from "./loadSchema";

export function SchemaPanel({ game, sqlText }: { game: string; sqlText: string }) {
  const [schema, setSchema] = useState<SqlSchema>({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let active = true;
    loadSchema(game).then(result => active && setSchema(result));
    return () => { active = false; };
  }, [game]);

  const used = useMemo(() => columnsUsed(sqlText, schema), [sqlText, schema]);

  const needle = filter.trim().toLowerCase();
  const tables = Object.entries(schema).filter(([table, cols]) =>
    !needle || table.toLowerCase().includes(needle) || cols.some(col => col.toLowerCase().includes(needle)));

  return (
    <div className="df-schema">
      <div className="df-eyebrow df-schema-title">Schema</div>
      <input
        className="df-schema-filter"
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="table or column"
      />
      {tables.length === 0 ? (
        <p className="df-schema-empty">No matching tables.</p>
      ) : tables.map(([table, cols], index) => (
        <details key={table} className="df-schema-table" open={index === 0}>
          <summary>
            <span className="df-schema-tablename">{table}</span>
            <span className="df-schema-count">{cols.length} column{cols.length === 1 ? '' : 's'}</span>
          </summary>
          <ul>
            {cols.filter(col => !needle || table.toLowerCase().includes(needle) || col.toLowerCase().includes(needle)).map(col => (
              <li key={col} className={used.has(col) ? 'df-schema-used' : undefined}>{col}</li>
            ))}
          </ul>
        </details>
      ))}
      <p className="df-schema-hint">Highlighted columns appear in your query.</p>
    </div>
  );
}
