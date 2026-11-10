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
import { SqlSchema } from "./schema";
import { loadSchema } from "./loadSchema";
import { ExerciseId } from "./exerciseModels";
import { pingActivity } from "./activityPing";

const SUBMIT_EVENT = 'sql-editor-submit';

const submitKeymap = Prec.highest(keymap.of([{
  key: 'Mod-Enter',
  run: view => {
    view.dom.dispatchEvent(new CustomEvent(SUBMIT_EVENT, { bubbles: true }));
    return true;
  },
}]));

type SqlProblem = { message: string; from: number; to: number };

const devfestTheme = EditorView.theme({
  '&': {
    color: 'var(--df-cream)',
    backgroundColor: 'var(--df-bg-raised)',
    border: '1px solid var(--df-border-soft)',
    borderRadius: '12px',
    fontSize: '17px',
  },
  '&.cm-focused': {
    outline: 'none',
    borderColor: 'var(--df-gold-deep)',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    lineHeight: '1.6',
    fontVariantLigatures: 'none',
  },
  '.cm-content': { caretColor: 'var(--df-gold)', padding: '10px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--df-gold)', borderLeftWidth: '2px' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(233, 180, 76, 0.25) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--df-surface)',
    color: 'var(--df-muted)',
    border: 'none',
    borderTopLeftRadius: '12px',
    borderBottomLeftRadius: '12px',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(233, 180, 76, 0.06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(233, 180, 76, 0.12)', color: 'var(--df-cream)' },
  '.cm-placeholder': { color: 'var(--df-muted)' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(233, 180, 76, 0.2)', outline: 'none' },
  '.cm-tooltip': {
    backgroundColor: 'var(--df-surface)',
    color: 'var(--df-cream)',
    border: '1px solid var(--df-border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete > ul > li': { padding: '3px 10px !important' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(233, 180, 76, 0.2)',
    color: 'var(--df-cream)',
  },
  '.cm-completionDetail': { color: 'var(--df-muted)' },
  '.cm-diagnostic-error': { borderLeftColor: '#ef6b5b' },
  '.cm-lintRange-error': {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23ef6b5b' fill='none' stroke-width='1.2'/%3E%3C/svg%3E\")",
  },
}, { dark: true });

const devfestHighlight = HighlightStyle.define([
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
  exerciseId?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  height?: string;
};

export function SqlEditor({ game, exerciseId, value, onChange, onSubmit, height = '275px' }: SqlEditorProps) {
  const [schema, setSchema] = useState<SqlSchema>({});
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }
    const handler = () => onSubmit();
    wrapper.addEventListener(SUBMIT_EVENT, handler);
    return () => wrapper.removeEventListener(SUBMIT_EVENT, handler);
  }, [onSubmit]);

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
    syntaxHighlighting(devfestHighlight),
    devfestTheme,
    EditorView.lineWrapping,
    placeholder('Enter your SQL… (Ctrl+Enter to submit)'),
    lintGutter(),
    linter(async view => {
      const text = view.state.doc.toString();
      if (exerciseId != null && game) {
        pingActivity(game as ExerciseId, exerciseId);
      }
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
    submitKeymap,
  ];
  }, [game, exerciseId, schema]);

  return (
    <div ref={wrapperRef}>
      <CodeMirror
        value={value}
        onChange={onChange}
        height={height}
        theme="none"
        extensions={extensions}
        autoFocus
        basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, autocompletion: true }}
      />
    </div>
  );
}
