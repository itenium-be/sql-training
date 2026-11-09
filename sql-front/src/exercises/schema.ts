export type SqlSchema = Record<string, string[]>;

export function columnsUsed(sqlText: string, schema: SqlSchema): Set<string> {
  const used = new Set<string>();
  if (!sqlText) {
    return used;
  }
  const haystack = sqlText.toLowerCase();
  const all = new Set<string>();
  Object.values(schema).forEach(cols => cols.forEach(col => all.add(col)));
  for (const col of all) {
    const escaped = col.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`).test(haystack)) {
      used.add(col);
    }
  }
  return used;
}
