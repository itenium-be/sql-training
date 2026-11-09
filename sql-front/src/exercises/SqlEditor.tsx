import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { MSSQL, PostgreSQL, sql } from "@codemirror/lang-sql";
import { Diagnostic, linter, lintGutter } from "@codemirror/lint";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";
import { completeFromList } from "@codemirror/autocomplete";
import { config } from "../config";

type SqlProblem = { message: string; from: number; to: number };
type SqlSchema = Record<string, string[]>;

const schemaCache = new Map<string, Promise<SqlSchema>>();

function loadSchema(game: string): Promise<SqlSchema> {
  const key = game === 'Worldcup' ? 'mssql' : 'pg';
  if (!schemaCache.has(key)) {
    const request = fetch(`${config.api}/exercises/schema?game=${encodeURIComponent(game)}`)
      .then(res => res.json())
      .then(data => (data.success ? data.responseObject : {}) as SqlSchema)
      .catch(() => {
        schemaCache.delete(key);
        return {};
      });
    schemaCache.set(key, request);
  }
  return schemaCache.get(key)!;
}

const editorTheme = EditorView.theme({
  '&': {
    color: 'var(--df-strong)',
    backgroundColor: 'var(--df-bg-raised)',
    border: 'var(--df-border-width) solid var(--df-border-soft)',
    borderRadius: 'var(--df-radius)',
    fontSize: '17px',
  },
  '&.cm-focused': {
    outline: 'none',
    borderColor: 'var(--df-accent-deep)',
  },
  '.cm-scroller': {
    fontFamily: 'var(--df-font-mono)',
    lineHeight: '1.6',
    fontVariantLigatures: 'none',
  },
  '.cm-content': { caretColor: 'var(--df-accent)', padding: '10px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--df-accent)', borderLeftWidth: '2px' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(var(--df-accent-rgb), 0.25) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--df-surface)',
    color: 'var(--df-muted)',
    border: 'none',
    borderTopLeftRadius: 'var(--df-radius)',
    borderBottomLeftRadius: 'var(--df-radius)',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(var(--df-accent-rgb), 0.06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(var(--df-accent-rgb), 0.12)', color: 'var(--df-strong)' },
  '.cm-placeholder': { color: 'var(--df-muted)' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(var(--df-accent-rgb), 0.2)', outline: 'none' },
  '.cm-tooltip': {
    backgroundColor: 'var(--df-surface)',
    color: 'var(--df-strong)',
    border: '1px solid var(--df-border)',
    borderRadius: 'var(--df-radius)',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete > ul > li': { padding: '3px 10px !important' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(var(--df-accent-rgb), 0.2)',
    color: 'var(--df-strong)',
  },
  '.cm-completionDetail': { color: 'var(--df-muted)' },
  '.cm-diagnostic-error': { borderLeftColor: 'var(--df-danger)' },
  '.cm-lintRange-error': {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23ef6b5b' fill='none' stroke-width='1.2'/%3E%3C/svg%3E\")",
  },
}, { dark: true });

const editorHighlight = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--df-syn-keyword)', fontWeight: '600' },
  { tag: [t.operatorKeyword, t.operator], color: 'var(--df-syn-operator)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--df-syn-string)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--df-syn-number)' },
  { tag: [t.typeName, t.standard(t.name)], color: 'var(--df-syn-type)' },
  { tag: [t.function(t.variableName), t.function(t.name)], color: 'var(--df-syn-function)' },
  { tag: [t.lineComment, t.blockComment, t.comment], color: 'var(--df-syn-comment)', fontStyle: 'italic' },
  { tag: t.special(t.name), color: 'var(--df-syn-special)' },
  { tag: [t.punctuation, t.paren, t.squareBracket, t.brace, t.separator], color: 'var(--df-syn-punctuation)' },
  { tag: t.name, color: 'var(--df-syn-name)' },
]);

async function validate(game: string, text: string): Promise<SqlProblem[]> {
  const res = await fetch(`${config.api}/exercises/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game, sql: text }),
  });
  const data = await res.json();
  return data.success ? data.responseObject : [];
}

type SqlEditorProps = {
  game: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  height?: string;
};

export function SqlEditor({ game, value, onChange, onSubmit, height = '275px' }: SqlEditorProps) {
  const [schema, setSchema] = useState<SqlSchema>({});
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  useEffect(() => {
    let active = true;
    loadSchema(game).then(result => active && setSchema(result));
    return () => { active = false; };
  }, [game]);

  const extensions = useMemo(() => {
    const dialect = game === 'Worldcup' ? MSSQL : PostgreSQL;
    const columns = new Map<string, string[]>();
    Object.entries(schema).forEach(([table, cols]) => cols.forEach(col => columns.set(col, [...(columns.get(col) ?? []), table])));
    const columnCompletions = completeFromList([...columns].map(([col, tables]) => ({ label: col, type: 'property', detail: tables.join(', '), boost: -1 })));
    return [
    sql({ dialect, schema, upperCaseKeywords: true }),
    dialect.language.data.of({ autocomplete: columnCompletions }),
    syntaxHighlighting(editorHighlight),
    editorTheme,
    EditorView.lineWrapping,
    placeholder('Enter your SQL… (Ctrl+Enter to submit)'),
    lintGutter(),
    linter(async view => {
      const text = view.state.doc.toString();
      try {
        const problems = await validate(game, text);
        if (view.state.doc.toString() !== text) {
          return [];
        }
        return problems.map<Diagnostic>(problem => {
          const from = Math.max(0, Math.min(problem.from, text.length));
          const to = Math.max(from, Math.min(problem.to, text.length));
          return { from, to: to === from && to < text.length ? to + 1 : to, severity: 'error', message: problem.message, source: game === 'Worldcup' ? 'SQL Server' : 'PostgreSQL' };
        });
      } catch {
        return [];
      }
    }, { delay: 600 }),
    Prec.highest(keymap.of([{
      key: 'Mod-Enter',
      run: () => {
        submitRef.current();
        return true;
      },
    }])),
  ];
  }, [game, schema]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height={height}
      theme="none"
      extensions={extensions}
      autoFocus
      basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, autocompletion: true }}
    />
  );
}
