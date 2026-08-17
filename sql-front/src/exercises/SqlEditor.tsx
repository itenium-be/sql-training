import { useCallback, useMemo, useState } from "react";
import AceEditor from "react-ace";
import { Button, ButtonGroup } from "react-bootstrap";
import { ExerciseId } from "./exerciseModels";
import { dialects, schemas } from "./schemas";
import { format } from "sql-formatter";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-sqlserver";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

type Completion = {
  caption: string;
  value: string;
  meta: string;
  score: number;
};

/** Tables and columns of the game you are playing, so tab completion knows the data. */
function schemaCompletions(game: ExerciseId): Completion[] {
  const schema = schemas[game];
  const tables = Object.keys(schema).map(table => ({
    caption: table,
    value: table,
    meta: 'table',
    score: 1000,
  }));

  // A column that appears in several tables should only be offered once.
  const columns = new Map<string, string[]>();
  Object.entries(schema).forEach(([table, cols]) => {
    cols.forEach(col => columns.set(col, [...(columns.get(col) ?? []), table]));
  });

  return tables.concat(
    [...columns.entries()].map(([column, inTables]) => ({
      caption: column,
      value: column,
      meta: inTables.join(', '),
      score: 900,
    })),
  );
}

type SqlEditorProps = {
  game: ExerciseId;
  value: string;
  onChange: (sql: string) => void;
  /** Ctrl-Enter runs the query without reaching for the mouse. */
  onSubmit: () => void;
}

export function SqlEditor({game, value, onChange, onSubmit}: SqlEditorProps) {
  const [formatError, setFormatError] = useState('');
  const dialect = dialects[game];

  const completer = useMemo(() => {
    const completions = schemaCompletions(game);
    return {
      getCompletions: (
        _editor: unknown,
        _session: unknown,
        _pos: unknown,
        _prefix: string,
        callback: (error: null, results: Completion[]) => void,
      ) => callback(null, completions),
    };
  }, [game]);

  const prettify = useCallback(() => {
    if (!value.trim()) {
      return;
    }

    try {
      onChange(format(value, {
        language: dialect,
        keywordCase: 'upper',
        dataTypeCase: 'upper',
        functionCase: 'upper',
        tabWidth: 2,
        expressionWidth: 60,
        linesBetweenQueries: 1,
      }));
      setFormatError('');
    } catch {
      // Half typed SQL is not parseable, which is entirely normal while writing it.
      setFormatError('Cannot format that yet, finish the statement first');
    }
  }, [value, dialect, onChange]);

  return (
    <>
      <AceEditor
        mode={dialect === 'transactsql' ? 'sqlserver' : 'sql'}
        theme="monokai"
        width="100%"
        height="275px"
        fontSize={18}
        showPrintMargin={false}
        showGutter
        wrapEnabled
        highlightActiveLine
        onChange={onChange}
        value={value}
        name={`sql-editor-${game}`}
        className="sql-editor"
        placeholder="Enter your SQL"
        focus
        setOptions={{
          // react-ace types this as boolean, but ace itself accepts a completer list.
          enableBasicAutocompletion: [completer] as unknown as boolean,
          enableLiveAutocompletion: true,
          enableSnippets: false,
          useWorker: false,
          tabSize: 2,
          behavioursEnabled: true,
        }}
        commands={[
          {
            name: 'formatSql',
            bindKey: {win: 'Ctrl-Shift-F', mac: 'Cmd-Shift-F'},
            exec: prettify,
          },
          {
            name: 'submitSql',
            bindKey: {win: 'Ctrl-Enter', mac: 'Cmd-Enter'},
            exec: onSubmit,
          },
        ]}
      />
      <ButtonGroup size="sm" style={{marginTop: 6}}>
        <Button variant="outline-secondary" onClick={prettify} disabled={!value.trim()} title="Ctrl-Shift-F">
          Format SQL
        </Button>
        <Button variant="outline-secondary" onClick={() => onChange('')} disabled={!value.length}>
          Clear
        </Button>
      </ButtonGroup>
      {formatError && <small className="text-muted" style={{marginLeft: 10}}>{formatError}</small>}
    </>
  )
}
