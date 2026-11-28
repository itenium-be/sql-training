export function sampleTables(query: string): string[] {
  const names = [...query.matchAll(/\b(?:FROM|JOIN)\s+([\w.[\]]+)/gi)].map(m => m[1]);
  return [...new Set(names)];
}
