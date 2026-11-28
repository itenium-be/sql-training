import { describe, expect, test } from 'bun:test';
import { highlightSql } from './sqlHighlight';

describe('highlightSql', () => {
  const query = "SELECT name, 'x'\nFROM countries";
  const segments = highlightSql(query, 'World');

  test('keeps the query text intact, newlines included', () => {
    expect(segments.map(s => s.text).join('')).toBe(query);
  });

  test('gives keywords and strings different classes', () => {
    const cls = (text: string) => segments.find(s => s.text === text)?.className;
    expect(cls('SELECT')).toBeTruthy();
    expect(cls("'x'")).toBeTruthy();
    expect(cls('SELECT')).not.toBe(cls("'x'"));
    expect(cls('FROM')).toBe(cls('SELECT'));
  });

  test('reads SQL Server brackets as one identifier for Worldcup', () => {
    expect(highlightSql('SELECT e.[key] FROM events e', 'Worldcup').some(s => s.text === '[key]')).toBe(true);
  });
});
