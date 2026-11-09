import type { ExerciseModel } from "./models";

export const worldcupExercises: ExerciseModel = {
  id: "Worldcup",
  name: "Let's footy",
  sampleQuery: `SELECT TOP 3 e.[key], r.name AS Round, t1.name AS Team1, c1.code AS Team1Code, m.score1, t2.name AS Team2, c2.code AS Team2Code, m.score2
FROM matches m JOIN teams t1 ON t1.id=m.team1_id JOIN countries c1 ON t1.country_id=c1.id
JOIN teams t2 ON t2.id=m.team2_id JOIN countries c2 ON t2.country_id=c2.id
JOIN rounds r ON m.round_id=r.id JOIN events e ON r.event_id=e.id`,
  desc: "More tables. (sql server)",
  schema: true,
  exercises: [
    {
      id: 1,
      desc: "Which country was always present?",
      points: 9,
      expected: [["Brazil"]],
      expectedOrder: false,
      solution: `SELECT t.name
FROM events_teams et
JOIN teams t ON t.id = et.team_id
GROUP BY t.name
HAVING COUNT(DISTINCT et.event_id) = (SELECT COUNT(*) FROM events)`,
      expectedColumns: ["team.name"],
    },
    {
      id: 2,
      desc: "Which country benefited from the most own goals by its opponents? Also select how many.",
      points: 12,
      expected: [["France", 4]],
      expectedOrder: false,
      solution: `SELECT TOP 1 t.name, COUNT(*) AS owngoal_count
FROM goals g
JOIN teams t ON t.id = g.team_id
WHERE g.owngoal = 1
GROUP BY t.name
ORDER BY COUNT(*) DESC`,
      expectedColumns: ["team.name", "owngoal_count"],
    },
    {
      id: 3,
      desc: "Select the year of the worldcup in which the most penalties were scored, also select the amount of penalties.",
      points: 12,
      expected: [[2018, 22]],
      expectedOrder: false,
      solution: `SELECT TOP 1 YEAR(e.start_date) AS year, COUNT(*) AS amount
FROM goals g
JOIN matches m ON m.id = g.match_id
JOIN events e ON e.id = m.event_id
WHERE g.penalty = 1
GROUP BY YEAR(e.start_date)
ORDER BY COUNT(*) DESC`,
      expectedColumns: ["year", "amount"],
    },
    {
      id: 4,
      desc: 'Find players that played for different countries and a "," separated list of countries they played for',
      points: 18,
      expected: [
        ["Cheryshev", "Russia,Uruguay"],
        ["Enzo Fernández", "Argentina,Australia"],
        ["Fernandinho", "Belgium,Brazil"],
        ["M. Rosas", "Chile,Mexico"],
        ["Mandžukic", "Croatia,France"],
        ["Varela", "Portugal,Uruguay"],
        ["Vidal", "Chile,Uruguay"],
      ],
      expectedOrder: false,
      solution: `SELECT p.name, STRING_AGG(t.name, ',') WITHIN GROUP (ORDER BY t.name) AS countries
FROM (SELECT DISTINCT person_id, team_id FROM goals) g
JOIN persons p ON p.id = g.person_id
JOIN teams t ON t.id = g.team_id
GROUP BY p.id, p.name
HAVING COUNT(*) > 1`,
      expectedColumns: ["person.name", "countries"],
    },
    {
      id: 5,
      desc: 'Which countries always survived the "Group Stage" (when present), and how many times was this? (A round not called "Matchday")',
      points: 24,
      expected: [
        ["Netherlands", 11],
        ["Dutch East Indies (-1945)", 1],
        ["Cuba", 1],
        ["Turkey", 2],
        ["Ireland", 3],
        ["Ukraine", 1],
        ["Slovakia", 1],
      ],
      expectedOrder: false,
      solution: `WITH present AS (
  SELECT DISTINCT et.event_id, t.country_id
  FROM events_teams et
  JOIN teams t ON t.id = et.team_id
), survived AS (
  SELECT DISTINCT m.event_id, t.country_id
  FROM matches m
  JOIN rounds r ON r.id = m.round_id
  JOIN teams t ON t.id IN (m.team1_id, m.team2_id)
  WHERE r.name NOT LIKE 'Matchday%'
)
SELECT c.name, COUNT(*) AS times_participated
FROM present p
JOIN countries c ON c.id = p.country_id
LEFT JOIN survived s ON s.event_id = p.event_id AND s.country_id = p.country_id
GROUP BY c.name
HAVING COUNT(s.event_id) = COUNT(*)`,
      expectedColumns: ["country.name", "times_participated"],
    },
    {
      id: 6,
      desc: 'For the player that scored the most goals, list the worldcup.YYYY, the round name, the match date (YYYY-MM-DD), the goal minute, scored Y/N and the total amount of goals scored so far. Order by match date. To keep things "simple", evaluate only events.id 20, 21 and 22 and team.id 1.',
      points: 30,
      expected: [
        ["worldcup.2014", "Matchday 4", "2014-06-15", 65, "Y", 1],
        ["worldcup.2014", "Matchday 10", "2014-06-21", 90, "Y", 2],
        ["worldcup.2014", "Matchday 14", "2014-06-25", 3, "Y", 4],
        ["worldcup.2014", "Matchday 14", "2014-06-25", 45, "Y", 4],
        ["worldcup.2014", "Round of 16", "2014-07-01", null, "N", 4],
        ["worldcup.2014", "Quarter-finals", "2014-07-05", null, "N", 4],
        ["worldcup.2014", "Semi-finals", "2014-07-09", null, "N", 4],
        ["worldcup.2014", "Final", "2014-07-13", null, "N", 4],
        ["worldcup.2018", "Matchday 3", "2018-06-16", null, "N", 4],
        ["worldcup.2018", "Matchday 8", "2018-06-21", null, "N", 4],
        ["worldcup.2018", "Matchday 13", "2018-06-26", null, "N", 4],
        ["worldcup.2018", "Round of 16", "2018-06-30", null, "N", 4],
        ["worldcup.2022", "Matchday 3", "2022-11-22", 10, "Y", 5],
        ["worldcup.2022", "Matchday 7", "2022-11-26", 64, "Y", 6],
        ["worldcup.2022", "Matchday 11", "2022-11-30", null, "N", 6],
        ["worldcup.2022", "Round of 16", "2022-12-03", 35, "Y", 7],
        ["worldcup.2022", "Quarter-finals", "2022-12-09", 73, "Y", 8],
        ["worldcup.2022", "Semi-finals", "2022-12-13", 34, "Y", 9],
        ["worldcup.2022", "Final", "2022-12-18", 23, "Y", 11],
        ["worldcup.2022", "Final", "2022-12-18", 108, "Y", 11],
      ],
      expectedOrder: true,
      solution: `WITH scorer AS (
  SELECT TOP 1 g.person_id
  FROM goals g
  JOIN matches m ON m.id = g.match_id
  WHERE m.event_id IN (20, 21, 22) AND g.team_id = 1 AND g.owngoal = 0
  GROUP BY g.person_id
  ORDER BY COUNT(*) DESC
)
SELECT e.[key] AS [worldcup.YYYY], r.name AS [round.name], CONVERT(varchar(10), m.[date], 23) AS [match.date],
  g.[minute] AS [goal.minute], CASE WHEN g.id IS NULL THEN 'N' ELSE 'Y' END AS [scored Y/N],
  COUNT(g.id) OVER (ORDER BY m.[date]) AS total_scored_so_far
FROM matches m
JOIN events e ON e.id = m.event_id
JOIN rounds r ON r.id = m.round_id
LEFT JOIN goals g ON g.match_id = m.id AND g.team_id = 1 AND g.owngoal = 0 AND g.person_id = (SELECT person_id FROM scorer)
WHERE m.event_id IN (20, 21, 22) AND 1 IN (m.team1_id, m.team2_id)
ORDER BY m.[date], g.[minute]`,
      expectedColumns: [
        "worldcup.YYYY",
        "round.name",
        "match.date",
        "goal.minute",
        "scored Y/N",
        "total_scored_so_far",
      ],
    },
  ],
};
