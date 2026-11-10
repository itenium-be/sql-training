type DiagramKey = 'PK' | 'FK';
type DiagramColumn = { name: string; type: string; key?: DiagramKey };
type DiagramEntity = { name: string; cols: DiagramColumn[] };
type DiagramRel = { from: string; to: string; label: string };
export type DiagramModel = { entities: DiagramEntity[]; rels: DiagramRel[] };

export function toMermaid(model: DiagramModel): string {
  const lines = ['erDiagram'];
  for (const rel of model.rels) {
    lines.push(`  ${rel.from} ||--o{ ${rel.to} : ${rel.label}`);
  }
  for (const entity of model.entities) {
    lines.push(`  ${entity.name} {`);
    for (const col of entity.cols) {
      lines.push(`    ${col.type} ${col.name}${col.key ? ` ${col.key}` : ''}`);
    }
    lines.push('  }');
  }
  return lines.join('\n');
}

const pk: DiagramKey = 'PK';
const fk: DiagramKey = 'FK';

const world: DiagramModel = {
  entities: [
    { name: 'countries', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'name', type: 'varchar' },
      { name: 'continent', type: 'varchar' },
      { name: 'area', type: 'numeric' },
      { name: 'population', type: 'bigint' },
      { name: 'gdp', type: 'numeric' },
      { name: 'capital', type: 'varchar' },
      { name: 'tld', type: 'varchar' },
    ] },
  ],
  rels: [],
};

const teachers: DiagramModel = {
  entities: [
    { name: 'teachers', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'dept', type: 'numeric', key: fk },
      { name: 'name', type: 'varchar' },
      { name: 'phone', type: 'varchar' },
      { name: 'mobile', type: 'varchar' },
      { name: 'employed_at', type: 'date' },
      { name: 'birth_date', type: 'date' },
      { name: 'salary', type: 'numeric' },
    ] },
    { name: 'departments', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'name', type: 'varchar' },
      { name: 'phone', type: 'varchar' },
    ] },
  ],
  rels: [{ from: 'departments', to: 'teachers', label: 'employs' }],
};

const company: DiagramModel = {
  entities: [
    { name: 'employees', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'name', type: 'varchar' },
      { name: 'manager_id', type: 'int', key: fk },
      { name: 'department', type: 'varchar' },
      { name: 'job_title', type: 'varchar' },
      { name: 'hired_at', type: 'date' },
      { name: 'salary', type: 'int' },
    ] },
    { name: 'customers', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'name', type: 'varchar' },
      { name: 'country', type: 'varchar' },
      { name: 'created_at', type: 'date' },
    ] },
    { name: 'products', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'name', type: 'varchar' },
      { name: 'category', type: 'varchar' },
      { name: 'price', type: 'numeric' },
      { name: 'attributes', type: 'jsonb' },
    ] },
    { name: 'orders', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'customer_id', type: 'int', key: fk },
      { name: 'employee_id', type: 'int', key: fk },
      { name: 'ordered_at', type: 'timestamp' },
      { name: 'status', type: 'varchar' },
    ] },
    { name: 'order_lines', cols: [
      { name: 'order_id', type: 'int', key: fk },
      { name: 'line_no', type: 'int', key: pk },
      { name: 'product_id', type: 'int', key: fk },
      { name: 'quantity', type: 'int' },
      { name: 'unit_price', type: 'numeric' },
    ] },
  ],
  rels: [
    { from: 'customers', to: 'orders', label: 'places' },
    { from: 'employees', to: 'orders', label: 'takes' },
    { from: 'employees', to: 'employees', label: 'manages' },
    { from: 'orders', to: 'order_lines', label: 'contains' },
    { from: 'products', to: 'order_lines', label: 'appears_in' },
  ],
};

const worldcup: DiagramModel = {
  entities: [
    { name: 'countries', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'name', type: 'varchar' },
      { name: 'slug', type: 'varchar' },
      { name: 'key', type: 'varchar' },
      { name: 'code', type: 'varchar' },
    ] },
    { name: 'teams', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'key', type: 'varchar' },
      { name: 'name', type: 'varchar' },
      { name: 'code', type: 'varchar' },
      { name: 'country_id', type: 'int', key: fk },
    ] },
    { name: 'seasons', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'key', type: 'varchar' },
      { name: 'name', type: 'varchar' },
    ] },
    { name: 'events', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'key', type: 'varchar' },
      { name: 'season_id', type: 'int', key: fk },
      { name: 'start_date', type: 'date' },
    ] },
    { name: 'events_teams', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'event_id', type: 'int', key: fk },
      { name: 'team_id', type: 'int', key: fk },
    ] },
    { name: 'groups', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'event_id', type: 'int', key: fk },
      { name: 'name', type: 'varchar' },
      { name: 'pos', type: 'int' },
      { name: 'key', type: 'varchar' },
    ] },
    { name: 'groups_teams', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'group_id', type: 'int', key: fk },
      { name: 'team_id', type: 'int', key: fk },
    ] },
    { name: 'rounds', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'event_id', type: 'int', key: fk },
      { name: 'name', type: 'varchar' },
      { name: 'pos', type: 'int' },
    ] },
    { name: 'persons', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'key', type: 'varchar' },
      { name: 'name', type: 'varchar' },
    ] },
    { name: 'matches', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'key', type: 'varchar' },
      { name: 'event_id', type: 'int', key: fk },
      { name: 'pos', type: 'int' },
      { name: 'num', type: 'int' },
      { name: 'team1_id', type: 'int', key: fk },
      { name: 'team2_id', type: 'int', key: fk },
      { name: 'round_id', type: 'int', key: fk },
      { name: 'group_id', type: 'int', key: fk },
      { name: 'date', type: 'date' },
      { name: 'score1', type: 'int' },
      { name: 'score2', type: 'int' },
      { name: 'next_match_id', type: 'int', key: fk },
      { name: 'prev_match_id', type: 'int', key: fk },
      { name: 'winner', type: 'int' },
    ] },
    { name: 'goals', cols: [
      { name: 'id', type: 'int', key: pk },
      { name: 'person_id', type: 'int', key: fk },
      { name: 'match_id', type: 'int', key: fk },
      { name: 'team_id', type: 'int', key: fk },
      { name: 'minute', type: 'int' },
      { name: 'penalty', type: 'bit' },
      { name: 'owngoal', type: 'bit' },
    ] },
  ],
  rels: [
    { from: 'countries', to: 'teams', label: 'fields' },
    { from: 'seasons', to: 'events', label: 'has' },
    { from: 'events', to: 'events_teams', label: 'lists' },
    { from: 'teams', to: 'events_teams', label: 'in' },
    { from: 'events', to: 'groups', label: 'has' },
    { from: 'groups', to: 'groups_teams', label: 'holds' },
    { from: 'teams', to: 'groups_teams', label: 'in' },
    { from: 'events', to: 'rounds', label: 'has' },
    { from: 'events', to: 'matches', label: 'has' },
    { from: 'teams', to: 'matches', label: 'plays' },
    { from: 'rounds', to: 'matches', label: 'phase' },
    { from: 'groups', to: 'matches', label: 'within' },
    { from: 'matches', to: 'goals', label: 'scores' },
    { from: 'persons', to: 'goals', label: 'by' },
    { from: 'teams', to: 'goals', label: 'for' },
  ],
};

export const diagrams: Record<string, DiagramModel> = { World: world, Teachers: teachers, Company: company, Worldcup: worldcup };
