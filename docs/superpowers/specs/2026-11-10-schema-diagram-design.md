Schema Diagram
==============

Render an ER diagram of each game's schema, shown as a results tab in the exercise IDE and
inline on the pre-exercise intro screen.

## Why

The exercise-layout mockup had a **Diagram** control on the Schema panel that never shipped.
Learners see a flat column list but not how the tables relate — the relationships are the hard
part of every join exercise.

## Scope

- Diagram as a 4th results tab (`Your result · Expected · Sample data · Diagram`) in the IDE.
- Diagram inline on the intro screen (`currentExercise === 0`), below Example Data, always shown.
- All four games: `World`, `Teachers`, `Company`, `Worldcup`.

Out of scope: the Schema panel's own column list (unchanged), backend changes, clickable
column insertion.

## Approach

Mermaid `erDiagram`, chosen over a hand-rolled renderer for crow's-foot notation and
auto-layout. Mermaid is dynamically imported so it never enters the main bundle.

Relationships and types are not in the `/exercises/schema` payload (`table → [columns]` only),
so each game's diagram is hand-authored in the frontend from the real DDL. This also captures
edges a naming heuristic would miss: `employees.manager_id` (self-ref), `matches.next_match_id`
(self-ref), `teachers.dept → departments`.

## Components

### `exercises/diagrams.ts`

Pure data + serializer. No React, no mermaid import.

```ts
type Key = 'PK' | 'FK';
type Column = { name: string; type: string; key?: Key };
type Entity = { name: string; cols: Column[] };
type Rel = { from: string; to: string; label: string };   // from 1 --- many to
type DiagramModel = { entities: Entity[]; rels: Rel[] };

export const diagrams: Record<string, DiagramModel>;       // keyed by game id
export function toMermaid(model: DiagramModel): string;
```

`toMermaid` emits:

```
erDiagram
  customers ||--o{ orders : places
  ...
  customers {
    int id PK
    varchar name
  }
  ...
```

Worldcup omits `created_at` / `updated_at` audit columns. `matches` keeps its full score column
set — the box is tall but faithful.

### `exercises/SchemaDiagram.tsx`

`<SchemaDiagram game={string} />`

- `useEffect` → `await import('mermaid')`, `mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables, er: { useMaxWidth: false } })`, `mermaid.render(id, toMermaid(model))`, inject the returned SVG.
- Amber theming via `themeVariables` + the CSS overrides proven in the mockup
  (`.er.entityBox`, `.er.attributeBox*`, `.relationshipLine`, text fill).
- Unknown game → quiet fallback text, no throw, no mermaid load.

### Integration — `exercises/Exercise.tsx`

- Intro branch (`currentExIndex === 0`): `<SchemaDiagram game={currentGame} />` below `<ExerciseSampleData />`. Needs `currentGame` from `state.exercises.selected`.
- `SqlExercise`: `resultTab` type gains `'diagram'`; a **Diagram** tab button after Sample data;
  body renders `<SchemaDiagram game={currentGame} />` when active.

## Testing

`diagrams.test.ts` (`bun:test`):

- `toMermaid` output starts with `erDiagram`.
- Each entity renders a block with its columns; a `PK` column carries the `PK` marker, an `FK`
  column the `FK` marker.
- Each rel renders as `from ||--o{ to : label`.
- `diagrams` has an entry for every game id (`World`, `Teachers`, `Company`, `Worldcup`), and
  every entry is non-empty.
- A self-referential rel (`employees → employees`) serializes without collapsing.

The component is thin glue over mermaid (no DOM test infra in this repo); it is verified by
running the app.

## Dependency

Add `mermaid` to `sql-front`, imported dynamically only.
