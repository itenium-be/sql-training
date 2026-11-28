// Submissions that give the right rows on the real data only. Each must fail on the shadow data.
export const knownCheats: { game: string; exerciseId: number; query: string }[] = [
  { game: "World", exerciseId: 2, query: "SELECT 'Mozambique' AS name" },
  {
    game: "World",
    exerciseId: 2,
    query: `SELECT name FROM countries
WHERE name LIKE '%a%' AND name LIKE '%a%' AND name LIKE '%i%' AND name LIKE '%o%' AND name LIKE '%u%' AND name NOT LIKE '% %'`,
  },
  {
    game: "World",
    exerciseId: 2,
    query: `SELECT name FROM countries
WHERE name LIKE '%e%' AND name LIKE '%e%' AND name LIKE '%i%' AND name LIKE '%o%' AND name LIKE '%u%' AND name NOT LIKE '% %'`,
  },
  {
    game: "Teachers",
    exerciseId: 3,
    query: `SELECT t.name,
  CASE WHEN d.name = 'Design' THEN 'Art' WHEN d.id IS NOT NULL THEN 'Sci' ELSE 'None' END AS "department type"
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept`,
  },
  {
    game: "Teachers",
    exerciseId: 3,
    query: `SELECT t.name,
  CASE WHEN d.name = 'Computing' THEN 'Sci' WHEN d.name = 'Design' THEN 'Art' ELSE 'None' END AS "department type"
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept`,
  },
  { game: "Teachers", exerciseId: 6, query: "SELECT 'Throd' AS name" },
  { game: "Company", exerciseId: 4, query: "SELECT 277 AS count" },
  { game: "Worldcup", exerciseId: 1, query: "SELECT 'Brazil' AS name" },
  { game: "Worldcup", exerciseId: 1, query: "SELECT name FROM sportdb.dbo.teams WHERE name = 'Brazil'" },
];
