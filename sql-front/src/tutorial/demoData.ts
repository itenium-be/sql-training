import { ExerciseDetails, ExerciseModel, Score } from '../exercises/exerciseModels';

export const DEMO_GAME = 'World';
export const DEMO_EXERCISE = 1;
export const YOU = 'You';

export const demoDetails: ExerciseDetails = {
  desc: 'List the European countries with more than 50 million inhabitants, largest first.',
  expectedOrder: true,
  expectedColumns: ['name', 'population'],
};

export const demoHint = 'Filter on both continent and population, then sort with ORDER BY … DESC.';

const pending = (id: number, points: number) => ({ id, points, hasHint: true, hintCost: 1, expectedCost: 1 });

export const demoDefinitions: ExerciseModel[] = [
  {
    id: 'World',
    name: 'Countries of the world',
    sampleQuery: 'SELECT id, name, continent, area, population, gdp, capital, tld FROM countries',
    desc: 'The starter exercises! (postgres database)',
    exercises: [pending(DEMO_EXERCISE, 6), pending(2, 3), pending(3, 6)],
  },
  { id: 'Teachers', name: 'Teachers', sampleQuery: '', desc: '', exercises: [pending(1, 3), pending(2, 3), pending(3, 6), pending(4, 6)] },
  { id: 'Worldcup', name: 'Worldcup', sampleQuery: '', desc: '', exercises: [pending(1, 6), pending(2, 6), pending(3, 9)] },
  { id: 'Company', name: 'Company', sampleQuery: '', desc: '', exercises: [pending(1, 9), pending(2, 9)] },
];

export const demoSchema: Record<string, string[]> = {
  countries: ['id', 'name', 'continent', 'area', 'population', 'gdp', 'capital', 'tld'],
};

type Country = { name: string; continent: string; population: number; area: number; gdp: number; capital: string; tld: string };

const countries: Country[] = [
  { name: 'Russia', continent: 'Europe', population: 146000000, area: 17125242, gdp: 2029812000000, capital: 'Moscow', tld: '.ru' },
  { name: 'Germany', continent: 'Europe', population: 80716000, area: 357114, gdp: 3425956000000, capital: 'Berlin', tld: '.de' },
  { name: 'France', continent: 'Europe', population: 65906000, area: 640679, gdp: 2806428000000, capital: 'Paris', tld: '.fr' },
  { name: 'United Kingdom', continent: 'Europe', population: 64105700, area: 242900, gdp: 2518601000000, capital: 'London', tld: '.uk' },
  { name: 'Italy', continent: 'Europe', population: 60782668, area: 301336, gdp: 2071955000000, capital: 'Rome', tld: '.it' },
  { name: 'Spain', continent: 'Europe', population: 46507760, area: 505992, gdp: 1358687000000, capital: 'Madrid', tld: '.es' },
  { name: 'Ukraine', continent: 'Europe', population: 43009258, area: 603500, gdp: 177430000000, capital: 'Kiev', tld: '.ua' },
  { name: 'Poland', continent: 'Europe', population: 38496000, area: 312685, gdp: 517543000000, capital: 'Warsaw', tld: '.pl' },
  { name: 'Brazil', continent: 'South America', population: 202794000, area: 8515767, gdp: 2254109000000, capital: 'Brasília', tld: '.br' },
  { name: 'Japan', continent: 'Asia', population: 127090000, area: 377930, gdp: 4919563000000, capital: 'Tokyo', tld: '.jp' },
];

export const demoSampleData = countries.slice(0, 8).map((c, i) => ({ id: i + 1, ...c }));

const pick = (rows: Country[]) => rows.map(({ name, population }) => ({ name, population }));
const europe = countries.filter(c => c.continent === 'Europe');
const big = europe.filter(c => c.population > 50000000);

export const demoExpected = big.map(c => [c.name, c.population]);

export const demoCorrect = `SELECT name, population
FROM countries
WHERE continent = 'Europe' AND population > 50000000
ORDER BY population DESC`;

/** The tour types these in order; the fake checker answers each with its rows. */
export const demoAttempts: { sql: string; rows: Record<string, unknown>[]; correct: boolean }[] = [
  {
    sql: `SELECT name, population
FROM countries
WHERE continent = 'Europe'
ORDER BY population DESC`,
    rows: pick(europe),
    correct: false,
  },
  {
    sql: `SELECT *
FROM countries
WHERE continent = 'Europe' AND population > 50000000
ORDER BY population DESC`,
    rows: big.map((c, i) => ({ id: i + 1, ...c })),
    correct: false,
  },
  {
    sql: `SELECT name, population
FROM countries
WHERE continent = 'Europe' AND population > 50000000`,
    rows: pick([...big].sort((a, b) => a.name.localeCompare(b.name))),
    correct: false,
  },
  { sql: demoCorrect, rows: pick(big), correct: true },
];

export const demoCost = 4;

const score = (player: string, game: string, exerciseid: number, points: number, elapsed: number, solutionlength: number, cost: number): Score =>
  ({ player, game, exerciseid, points, elapsed, solutionlength, cost, hint: false, expected: false, attempts: 0 });

export const demoOthers: Score[] = [
  score('Ada', 'World', 1, 6, 74, 96, 4),
  score('Ada', 'World', 2, 3, 120, 140, 4),
  score('Edgar', 'World', 1, 5, 51, 88, 4),
  score('Edgar', 'Teachers', 1, 3, 95, 160, 6),
  score('Grace', 'World', 1, 6, 63, 102, 3),
];

export const demoSolutions = [
  { player: 'Ada', solution: "SELECT name, population FROM countries WHERE continent='Europe' AND population>50e6 ORDER BY 2 DESC" },
  { player: 'Edgar', solution: "SELECT name,population FROM countries WHERE continent='Europe' AND population>5e7 ORDER BY 2 DESC" },
  { player: 'Grace', solution: "SELECT name, population\nFROM countries\nWHERE population > 50000000 AND continent = 'Europe'\nORDER BY population DESC" },
];

export const demoPlayers = [
  { id: 1, name: 'Ada', avatar: 3 },
  { id: 2, name: 'Edgar', avatar: 7 },
  { id: 3, name: 'Grace', avatar: 12 },
  { id: 4, name: YOU, avatar: 1 },
];
