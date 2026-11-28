import { MSSQL, PostgreSQL } from "@codemirror/lang-sql";
import { HighlightStyle } from "@codemirror/language";
import { highlightCode, tags as t } from "@lezer/highlight";

export const sqlDialect = (game: string) => game === 'Worldcup' ? MSSQL : PostgreSQL;

export const devfestHighlight = HighlightStyle.define([
  { tag: t.keyword, color: '#e9b44c', fontWeight: '600' },
  { tag: [t.operatorKeyword, t.operator], color: '#e3a066' },
  { tag: [t.string, t.special(t.string)], color: '#a9c97a' },
  { tag: [t.number, t.bool, t.null], color: '#e98a5b' },
  { tag: [t.typeName, t.standard(t.name)], color: '#7fb8d4' },
  { tag: [t.function(t.variableName), t.function(t.name)], color: '#f0d28a' },
  { tag: [t.lineComment, t.blockComment, t.comment], color: '#8a7a5c', fontStyle: 'italic' },
  { tag: t.special(t.name), color: '#d9b8f0' },
  { tag: [t.punctuation, t.paren, t.squareBracket, t.brace, t.separator], color: '#bfae8a' },
  { tag: t.name, color: '#f0e2c2' },
]);

export type SqlSegment = { text: string; className: string };

export function highlightSql(query: string, game: string): SqlSegment[] {
  const tree = sqlDialect(game).language.parser.parse(query);
  const segments: SqlSegment[] = [];
  highlightCode(query, tree, devfestHighlight,
    (text, className) => segments.push({ text, className }),
    () => segments.push({ text: '\n', className: '' }));
  return segments;
}
