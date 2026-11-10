import { describe, expect, test } from 'bun:test';
import { diagrams, toMermaid } from './diagrams';

const sample = {
  entities: [
    { name: 'customers', cols: [{ name: 'id', type: 'int', key: 'PK' as const }, { name: 'name', type: 'varchar' }] },
    { name: 'orders', cols: [{ name: 'id', type: 'int', key: 'PK' as const }, { name: 'customer_id', type: 'int', key: 'FK' as const }] },
  ],
  rels: [{ from: 'customers', to: 'orders', label: 'places' }],
};

describe('toMermaid', () => {
  test('starts with the erDiagram header', () => {
    expect(toMermaid(sample).split('\n')[0]).toBe('erDiagram');
  });

  test('renders each entity as a block with its columns', () => {
    const out = toMermaid(sample);
    expect(out).toContain('customers {');
    expect(out).toContain('int id PK');
    expect(out).toContain('varchar name');
  });

  test('marks PK and FK columns', () => {
    const out = toMermaid(sample);
    expect(out).toContain('int id PK');
    expect(out).toContain('int customer_id FK');
  });

  test('renders a relationship as a one-to-many crow\'s-foot line', () => {
    expect(toMermaid(sample)).toContain('customers ||--o{ orders : places');
  });

  test('a self-referential relationship does not collapse', () => {
    const selfRef = {
      entities: [{ name: 'employees', cols: [{ name: 'id', type: 'int', key: 'PK' as const }] }],
      rels: [{ from: 'employees', to: 'employees', label: 'manages' }],
    };
    expect(toMermaid(selfRef)).toContain('employees ||--o{ employees : manages');
  });
});

describe('diagrams registry', () => {
  test.each(['World', 'Teachers', 'Company', 'Worldcup'])('has a non-empty model for %s', game => {
    const model = diagrams[game];
    expect(model).toBeDefined();
    expect(model.entities.length).toBeGreaterThan(0);
  });

  test('every model serializes to a valid erDiagram', () => {
    for (const model of Object.values(diagrams)) {
      expect(toMermaid(model).startsWith('erDiagram')).toBe(true);
    }
  });
});
