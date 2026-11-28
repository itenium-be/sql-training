# Shadow databases

A query that gives the right rows only on the real data. Each broken query below passes on the real data and fails on shadow (checked against the local databases).

## World

### World 1

> Give the name and the floored per capita GDP for all countries with a population of at least 200 million.

Shadow adds a country of exactly 200,000,000: `>` instead of `>=` misses it.

Broken:

```sql
SELECT name, FLOOR(gdp / population) AS "gdp per capita"
FROM countries
WHERE population > 200000000
```

Reference:

```sql
SELECT name, FLOOR(gdp / population) AS "gdp per capita"
FROM countries
WHERE population >= 200000000
```

### World 2

> Find the country that has all the vowels and no spaces in its name.

Shadow adds decoys missing one vowel. Testing `e` twice and forgetting `a` lets one through.

Broken:

```sql
SELECT name
FROM countries
WHERE name LIKE '%e%' AND name LIKE '%e%' AND name LIKE '%i%' AND name LIKE '%o%' AND name LIKE '%u%'
  AND name NOT LIKE '% %'
```

Reference:

```sql
SELECT name
FROM countries
WHERE name ILIKE '%a%' AND name ILIKE '%e%' AND name ILIKE '%i%' AND name ILIKE '%o%' AND name ILIKE '%u%'
  AND name NOT LIKE '% %'
```

### World 3

> For South America show population in millions and GDP in billions both to 2 decimal places. Sort them by largest GDP.

Argentina overtakes Brazil on GDP, so a hardcoded order breaks.

Broken:

```sql
SELECT * FROM (VALUES
  ('Brazil', 202.79, 2254.11),
  ('Argentina', 42.67, 477.03),
  ('Venezuela', 28.95, 382.42),
  ('Colombia', 47.66, 369.81),
  ('Chile', 17.77, 268.31),
  ('Peru', 30.48, 204.68),
  ('Ecuador', 15.77, 87.5),
  ('Uruguay', 3.29, 49.92),
  ('Bolivia', 10.03, 27.04),
  ('Paraguay', 6.78, 25.94),
  ('Suriname', 0.53, 5.01),
  ('Guyana', 0.78, 2.85),
  ('Saint Vincent and the Grenadines', 0.11, 0.69)
) v(name, "population (M)", "gdp (B)")
```

Reference:

```sql
SELECT name, ROUND(population / 1000000.0, 2) AS "population (M)", ROUND(gdp / 1000000000.0, 2) AS "gdp (B)"
FROM countries
WHERE continent = 'South America'
ORDER BY gdp DESC
```

### World 4

> Which countries have a GDP greater than every country in Europe?

Germany's GDP overtakes Japan's, so Japan drops out.

Broken:

```sql
SELECT name
FROM countries
WHERE name IN ('China', 'Japan', 'United States')
```

Reference:

```sql
SELECT name
FROM countries
WHERE gdp > ALL (SELECT gdp FROM countries WHERE continent = 'Europe')
```

### World 5

> Find the largest country (by area) in each continent, show the continent, the name and the area. Sort by continent.

The Dominican Republic overtakes Cuba as the largest in the Caribbean.

Broken:

```sql
SELECT * FROM (VALUES
  ('Africa', 'Algeria', 2381741),
  ('Asia', 'China', 9596961),
  ('Caribbean', 'Cuba', 109884),
  ('Eurasia', 'Russia', 17125242),
  ('Europe', 'Kazakhstan', 2724900),
  ('North America', 'Canada', 9984670),
  ('Oceania', 'Australia', 7692024),
  ('South America', 'Brazil', 8515767)
) v(continent, country, area)
```

Reference:

```sql
SELECT continent, name AS country, area
FROM countries c
WHERE area = (SELECT MAX(area) FROM countries x WHERE x.continent = c.continent)
ORDER BY continent
```

### World 6

> List the continents with the amount of countries in it, the country with the smallest area and its name, the total population and the rounded average gdp per capita.

Shadow adds countries to Asia, Africa and Oceania, so the counts and totals change.

Broken:

```sql
SELECT * FROM (VALUES
  ('Africa', 53, 452, 'Seychelles', 1016091005, 1783),
  ('Asia', 46, 300, 'Maldives', 4317455576, 5571),
  ('Caribbean', 11, 344, 'Grenada', 36149204, 5297),
  ('Eurasia', 2, 29743, 'Armenia', 149017400, 13688),
  ('Europe', 44, 0, 'Vatican City', 610261850, 30060),
  ('North America', 11, 261, 'Saint Kitts and Nevis', 518755156, 37012),
  ('Oceania', 14, 21, 'Nauru', 37783477, 46564),
  ('South America', 13, 389, 'Saint Vincent and the Grenadines', 407618970, 10194)
) v(continent, countries, "smallest area", "smallest name", "total population", "average gdp")
```

Reference:

```sql
SELECT continent, COUNT(*) AS countries, MIN(area) AS "smallest area",
  (SELECT name FROM countries x WHERE x.continent = c.continent ORDER BY area LIMIT 1) AS "smallest name",
  SUM(population) AS "total population", ROUND(SUM(gdp) / SUM(population)) AS "average gdp"
FROM countries c
GROUP BY continent
```

### World 7

> Show the name and the population of each country in Europe. Also show the population as the rounded percentage of the population of Germany. Only take the countries where the population is at least 50% and sort by largest %.

Germany's population changes. A hardcoded Germany breaks.

Broken:

```sql
SELECT name, population, ROUND(100.0 * population / 80716000) || '%' AS "population % of Germany"
FROM countries
WHERE continent = 'Europe' AND population >= 0.5 * 80716000
ORDER BY population DESC
```

Reference:

```sql
WITH germany AS (SELECT population FROM countries WHERE name = 'Germany')
SELECT name, population, ROUND(100.0 * population / (SELECT population FROM germany)) || '%' AS "population % of Germany"
FROM countries
WHERE continent = 'Europe' AND population >= 0.5 * (SELECT population FROM germany)
ORDER BY population DESC
```

### World 8

> Get confusing top level domains: tld (including the leading dot) that are the end of the name of at least two other countries, sorted by tld. Select the tld and a "," separated list of matching country names, sort the country names descending by population.

Palau is gone, so `.au` matches only once. Dropping the `HAVING` for a hardcoded tld list keeps it.

Broken:

```sql
SELECT c.tld, STRING_AGG(o.name, ',' ORDER BY o.population DESC) AS "country1,country2"
FROM countries c
JOIN countries o ON o.id <> c.id AND LOWER(o.name) LIKE '%' || SUBSTRING(c.tld FROM 2)
WHERE c.tld IN ('.al', '.ar', '.au', '.ca', '.co', '.es', '.in', '.la', '.na', '.ne', '.ru', '.us')
GROUP BY c.tld
ORDER BY c.tld
```

Reference:

```sql
SELECT c.tld, STRING_AGG(o.name, ',' ORDER BY o.population DESC) AS "country1,country2"
FROM countries c
JOIN countries o ON o.id <> c.id AND LOWER(o.name) LIKE '%' || SUBSTRING(c.tld FROM 2)
GROUP BY c.tld
HAVING COUNT(*) > 1
ORDER BY c.tld
```

## Teachers

### Teachers 1

> Display the deparments and the number of staff

Shadow adds the Administration department with 3 teachers.

Broken:

```sql
SELECT name, CASE name WHEN 'Computing' THEN 3 WHEN 'Design' THEN 1 ELSE 0 END AS count
FROM departments
```

Reference:

```sql
SELECT d.name, COUNT(t.id) AS count
FROM departments d
LEFT JOIN teachers t ON t.dept = d.id
GROUP BY d.name
```

### Teachers 2

> List all teachers with their department. Display "None" if they do not belong to a department.

Shadow teachers are in department 4. Hardcoded ids map them to None.

Broken:

```sql
SELECT name, CASE dept WHEN 1 THEN 'Computing' WHEN 2 THEN 'Design' ELSE 'None' END AS dept_name
FROM teachers
```

Reference:

```sql
SELECT t.name, COALESCE(d.name, 'None') AS dept_name
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept
```

### Teachers 3

> Show the name of the teacher and the department type: "Sci" for Computing and Engineering, "Art" for Design, "None" for anything else.

Shadow adds Administration (None) and an Engineering teacher (Sci). "Any department but Design is Sci" fails on the first; mapping only Computing to Sci fails on the second.

Broken:

```sql
SELECT t.name,
  CASE WHEN d.name = 'Design' THEN 'Art' WHEN d.id IS NOT NULL THEN 'Sci' ELSE 'None' END AS "department type"
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept
```

Reference:

```sql
SELECT t.name,
  CASE WHEN d.name IN ('Computing', 'Engineering') THEN 'Sci' WHEN d.name = 'Design' THEN 'Art' ELSE 'None' END AS "department type"
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept
```

### Teachers 4

> Show all teachers and their mobile number. If they don't have one, fallback to their extension and if they don't have an office, fallback to the department extension. We need to be able to call them right away, so phone numbers must start with +32 and be without any spaces. The school number is 09 331 0000

Snape falls back to the Administration extension. A hardcoded Design extension gives the wrong number.

Broken:

```sql
SELECT t.name, '+32' || REPLACE(COALESCE(
  SUBSTRING(t.mobile FROM 2),
  '9331' || SUBSTRING(t.phone FROM 5),
  '93313200'
), ' ', '') AS phone
FROM teachers t
```

Reference:

```sql
SELECT t.name, '+32' || REPLACE(COALESCE(
  SUBSTRING(t.mobile FROM 2),
  '9331' || SUBSTRING(t.phone FROM 5),
  '9331' || SUBSTRING(d.phone FROM 5)
), ' ', '') AS phone
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept
```

### Teachers 5

> Select all teacher with a name starting with "S" and their seniority (in years)

Moss has an `s`, but not at the start. `ILIKE '%s%'` picks Moss up.

Broken:

```sql
SELECT name, EXTRACT(YEAR FROM AGE(CURRENT_DATE, employed_at)) AS seniority
FROM teachers
WHERE name ILIKE '%s%'
```

Reference:

```sql
SELECT name, EXTRACT(YEAR FROM AGE(CURRENT_DATE, employed_at)) AS seniority
FROM teachers
WHERE name LIKE 'S%'
```

### Teachers 6

> Show the teacher names with a birthday today (3/10)

Moss was born on 10/3: day and month swapped. An either-way check picks Moss up.

Broken:

```sql
SELECT name
FROM teachers
WHERE EXTRACT(MONTH FROM birth_date) IN (3, 10) AND EXTRACT(DAY FROM birth_date) IN (3, 10)
```

Reference:

```sql
SELECT name
FROM teachers
WHERE EXTRACT(MONTH FROM birth_date) = 10 AND EXTRACT(DAY FROM birth_date) = 3
```

### Teachers 7

> Select the department name and the top 2 earners with their salary (include department-less teachers). Sort by department and highest salary.

Administration has 3 teachers. Excluding Shrivell by name, instead of ranking, keeps all 3.

Broken:

```sql
SELECT d.name AS department, t.name, t.salary
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept
WHERE t.name <> 'Shrivell'
ORDER BY department, salary DESC
```

Reference:

```sql
SELECT department, name, salary
FROM (
  SELECT d.name AS department, t.name, t.salary, RANK() OVER (PARTITION BY d.name ORDER BY t.salary DESC) AS rnk
  FROM teachers t
  LEFT JOIN departments d ON d.id = t.dept
) x
WHERE rnk <= 2
ORDER BY department, salary DESC
```

### Teachers 8

> Looking at the result of the previous exercise, there was only one record for the "Design" department. Adjust the query so that it adds an extra Design row with NULL values.

Same as Teachers 7.

Broken:

```sql
SELECT d.name AS department, t.name, t.salary
FROM teachers t
LEFT JOIN departments d ON d.id = t.dept
WHERE t.name <> 'Shrivell'
UNION ALL
SELECT 'Design', NULL, NULL
ORDER BY department, salary DESC NULLS LAST
```

Reference:

```sql
SELECT department, name, salary
FROM (
  SELECT d.name AS department, t.name, t.salary, RANK() OVER (PARTITION BY d.name ORDER BY t.salary DESC) AS rnk
  FROM teachers t
  LEFT JOIN departments d ON d.id = t.dept
) x
WHERE rnk <= 2
UNION ALL
SELECT 'Design', NULL, NULL
ORDER BY department, salary DESC NULLS LAST
```

## Worldcup

### Worldcup 1

> Which country was always present?

Argentina is added to every World Cup.

Broken:

```sql
SELECT 'Brazil' AS name
```

Reference:

```sql
SELECT t.name
FROM events_teams et
JOIN teams t ON t.id = et.team_id
GROUP BY t.name
HAVING COUNT(DISTINCT et.event_id) = (SELECT COUNT(*) FROM events)
```

### Worldcup 2

> Which country benefited from the most own goals by its opponents? Also select how many.

3 Australian goals become own goals, so Australia overtakes France.

Broken:

```sql
SELECT 'France' AS name, 4 AS owngoal_count
```

Reference:

```sql
SELECT TOP 1 t.name, COUNT(*) AS owngoal_count
FROM goals g
JOIN teams t ON t.id = g.team_id
WHERE g.owngoal = 1
GROUP BY t.name
ORDER BY COUNT(*) DESC
```

### Worldcup 3

> Select the year of the worldcup in which the most penalties were scored, also select the amount of penalties.

8 extra penalties in 2022, so 2022 overtakes 2018.

Broken:

```sql
SELECT 2018 AS year, 22 AS amount
```

Reference:

```sql
SELECT TOP 1 YEAR(e.start_date) AS year, COUNT(*) AS amount
FROM goals g
JOIN matches m ON m.id = g.match_id
JOIN events e ON e.id = m.event_id
WHERE g.penalty = 1
GROUP BY YEAR(e.start_date)
ORDER BY COUNT(*) DESC
```

### Worldcup 4

> Find players that played for different countries and a "," separated list of countries they played for

A player who scored for one country also scores for Brazil.

Broken:

```sql
SELECT p.name, STRING_AGG(t.name, ',') WITHIN GROUP (ORDER BY t.name) AS countries
FROM (SELECT DISTINCT person_id, team_id FROM goals) g
JOIN persons p ON p.id = g.person_id
JOIN teams t ON t.id = g.team_id
WHERE p.name IN ('Cheryshev', 'Enzo Fernández', 'Fernandinho', 'M. Rosas', 'Mandžukic', 'Varela', 'Vidal', 'Mohamed Hany', 'Aymen Hussein')
GROUP BY p.id, p.name
```

Reference:

```sql
SELECT p.name, STRING_AGG(t.name, ',') WITHIN GROUP (ORDER BY t.name) AS countries
FROM (SELECT DISTINCT person_id, team_id FROM goals) g
JOIN persons p ON p.id = g.person_id
JOIN teams t ON t.id = g.team_id
GROUP BY p.id, p.name
HAVING COUNT(*) > 1
```

### Worldcup 5

> Which countries always survived the "Group Stage" (when present), and how many times was this? (A round not called "Matchday")

The Netherlands are added to 1930 without reaching a knockout round.

Broken:

```sql
SELECT * FROM (VALUES
  ('Netherlands', 12),
  ('Dutch East Indies (-1945)', 1),
  ('Cuba', 1),
  ('Ireland', 3),
  ('Ukraine', 1),
  ('Slovakia', 1),
  ('Cape Verde', 1),
  ('DR Congo', 1)
) v(name, times_participated)
```

Reference:

```sql
WITH present AS (
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
HAVING COUNT(s.event_id) = COUNT(*)
```

### Worldcup 6

> For the player that scored the most goals, list the worldcup.YYYY, the round name, the match date (YYYY-MM-DD), the goal minute, scored Y/N and the total amount of goals scored so far. Order by match date. To keep things "simple", evaluate only events.id 20, 21 and 22 and team.id 1.

Messi takes Álvarez's first goal of 2014–2022, so the running totals shift.

Broken:

```sql
SELECT * FROM (VALUES
  ('worldcup.2014', 'Matchday 4', '2014-06-15', 65, 'Y', 1),
  ('worldcup.2014', 'Matchday 10', '2014-06-21', 90, 'Y', 2),
  ('worldcup.2014', 'Matchday 14', '2014-06-25', 3, 'Y', 4),
  ('worldcup.2014', 'Matchday 14', '2014-06-25', 45, 'Y', 4),
  ('worldcup.2014', 'Round of 16', '2014-07-01', NULL, 'N', 4),
  ('worldcup.2014', 'Quarter-finals', '2014-07-05', NULL, 'N', 4),
  ('worldcup.2014', 'Semi-finals', '2014-07-09', NULL, 'N', 4),
  ('worldcup.2014', 'Final', '2014-07-13', NULL, 'N', 4),
  ('worldcup.2018', 'Matchday 3', '2018-06-16', NULL, 'N', 4),
  ('worldcup.2018', 'Matchday 8', '2018-06-21', NULL, 'N', 4),
  ('worldcup.2018', 'Matchday 13', '2018-06-26', NULL, 'N', 4),
  ('worldcup.2018', 'Round of 16', '2018-06-30', NULL, 'N', 4),
  ('worldcup.2022', 'Matchday 3', '2022-11-22', 10, 'Y', 5),
  ('worldcup.2022', 'Matchday 7', '2022-11-26', 64, 'Y', 6),
  ('worldcup.2022', 'Matchday 11', '2022-11-30', NULL, 'N', 6),
  ('worldcup.2022', 'Round of 16', '2022-12-03', 35, 'Y', 7),
  ('worldcup.2022', 'Quarter-finals', '2022-12-09', 73, 'Y', 8),
  ('worldcup.2022', 'Semi-finals', '2022-12-13', 34, 'Y', 9),
  ('worldcup.2022', 'Final', '2022-12-18', 23, 'Y', 11),
  ('worldcup.2022', 'Final', '2022-12-18', 108, 'Y', 11)
) v([worldcup.YYYY], [round.name], [match.date], [goal.minute], [scored Y/N], total_scored_so_far)
```

Reference:

```sql
WITH scorer AS (
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
ORDER BY m.[date], g.[minute]
```

### Worldcup 7

> Which teams made their World Cup debut in 2026?

Jordan is added to 2022, so 2026 is not its debut.

Broken:

```sql
SELECT name
FROM teams
WHERE name IN ('Curaçao', 'Cape Verde', 'Jordan', 'DR Congo', 'Uzbekistan')
```

Reference:

```sql
SELECT t.name
FROM events_teams et
JOIN teams t ON t.id = et.team_id
GROUP BY t.id, t.name
HAVING MIN(et.event_id) = (SELECT id FROM events WHERE [key] = 'worldcup.2026')
```

## Company

### Company 1

> Which laptops have 64 GB of RAM?

One 64 GB laptop drops to 16 GB, and an 8 GB one goes to 64 GB.

Broken:

```sql
SELECT name
FROM products
WHERE name IN ('Lumen Laptop 667', 'Apex Laptop 779', 'Apex Laptop 835', 'Zento Laptop 159', 'Apex Laptop 439', 'Nimbus Laptop 495', 'Zento Laptop 719')
```

Reference:

```sql
SELECT name
FROM products
WHERE (attributes->>'ram_gb')::int = 64
```

### Company 2

> Which phones are available in pink?

One phone turns pink and another loses pink.

Broken:

```sql
SELECT name
FROM products
WHERE name IN ('Nimbus Phone 177', 'Apex Phone 625', 'Corvex Phone 849', 'Apex Phone 905', 'Corvex Phone 565', 'Lumen Phone 789', 'Corvex Phone 845')
```

Reference:

```sql
SELECT name
FROM products
WHERE category = 'Phone' AND attributes->'colors' ? 'pink'
```

### Company 3

> What is the revenue per laptop CPU?

An i5 laptop becomes an i9. June 2024 order lines triple.

Broken:

```sql
SELECT * FROM (VALUES
  ('Ryzen 5', 288615204.49),
  ('i5', 175691894.21),
  ('i9', 173112699.47),
  ('i7', 147532325.12),
  ('M3', 143480959.86),
  ('Ryzen 7', 15264805.67)
) v(cpu, revenue)
```

Reference:

```sql
SELECT p.attributes->>'cpu' AS cpu, SUM(l.quantity * l.unit_price) AS revenue
FROM order_lines l
JOIN products p ON p.id = l.product_id
JOIN orders o ON o.id = l.order_id
WHERE p.category = 'Laptop' AND o.status = 'delivered'
GROUP BY 1
```

### Company 4

> How many employees work (directly or indirectly) under the Head of Engineering?

A Sales manager and their team move under Engineering but keep `department = 'Sales'`.

Broken:

```sql
SELECT COUNT(*) - 1 AS count
FROM employees
WHERE department = 'Engineering'
```

Reference:

```sql
WITH RECURSIVE team AS (
  SELECT id FROM employees WHERE job_title = 'Head of Engineering'
  UNION ALL
  SELECT e.id FROM employees e JOIN team t ON e.manager_id = t.id
)
SELECT COUNT(*) - 1 AS count FROM team
```

### Company 5

> How many employees are there on each level of the org chart? The CEO is level 1.

The reparented subtree moves up a level.

Broken:

```sql
SELECT * FROM (VALUES
  (1, 1),
  (2, 6),
  (3, 30),
  (4, 212),
  (5, 845),
  (6, 400),
  (7, 6)
) v(level, count)
```

Reference:

```sql
WITH RECURSIVE chart AS (
  SELECT id, 1 AS level FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, c.level + 1 FROM employees e JOIN chart c ON e.manager_id = c.id
)
SELECT level, COUNT(*) AS count
FROM chart
GROUP BY level
ORDER BY level
```

### Company 6

> Show the revenue per month of 2024 (YYYY-MM) with a running total.

June 2024 triples. The 2024-03-15 orders are cancelled.

Broken:

```sql
SELECT * FROM (VALUES
  ('2024-01', 27185623.5, 27185623.5),
  ('2024-02', 27901946.03, 55087569.53),
  ('2024-03', 30300357.28, 85387926.81),
  ('2024-04', 33969229.94, 119357156.75),
  ('2024-05', 40028429.89, 159385586.64),
  ('2024-06', 41928823.45, 201314410.09),
  ('2024-07', 48172051.21, 249486461.3),
  ('2024-08', 53315031.8, 302801493.1),
  ('2024-09', 56275288.82, 359076781.92),
  ('2024-10', 63242892.64, 422319674.56),
  ('2024-11', 66622401.67, 488942076.23),
  ('2024-12', 75130671.79, 564072748.02)
) v(month, revenue, running_total)
```

Reference:

```sql
SELECT
  TO_CHAR(o.ordered_at, 'YYYY-MM') AS month,
  SUM(l.quantity * l.unit_price) AS revenue,
  SUM(SUM(l.quantity * l.unit_price)) OVER (ORDER BY TO_CHAR(o.ordered_at, 'YYYY-MM')) AS running_total
FROM orders o
JOIN order_lines l ON l.order_id = o.id
WHERE o.status = 'delivered' AND o.ordered_at >= '2024-01-01' AND o.ordered_at < '2025-01-01'
GROUP BY 1
ORDER BY 1
```

### Company 7

> Which month (YYYY-MM) had the biggest revenue drop compared to the month before? Also select the difference.

June 2024 triples, so July has the biggest drop.

Broken:

```sql
SELECT '2025-01' AS month, -4171480.37 AS diff
```

Reference:

```sql
SELECT month, diff
FROM (
  SELECT
    TO_CHAR(o.ordered_at, 'YYYY-MM') AS month,
    SUM(l.quantity * l.unit_price) - LAG(SUM(l.quantity * l.unit_price)) OVER (ORDER BY TO_CHAR(o.ordered_at, 'YYYY-MM')) AS diff
  FROM orders o
  JOIN order_lines l ON l.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY 1
) m
ORDER BY diff
LIMIT 1
```

### Company 8

> What is the most ordered product (total quantity, all orders) in each category?

June 2024 quantities triple.

Broken:

```sql
SELECT * FROM (VALUES
  ('Chair', 'Sitwell Chair 149', 44966),
  ('Desk', 'Oakline Desk 156', 42447),
  ('Headset', 'Klikk Headset 128', 55032),
  ('Keyboard', 'Klikk Keyboard 135', 51003),
  ('Laptop', 'Nimbus Laptop 107', 125112),
  ('Monitor', 'Nimbus Monitor 114', 74021),
  ('Mouse', 'Sonora Mouse 142', 47442),
  ('Phone', 'Zento Phone 121', 61989)
) v(category, name, quantity)
```

Reference:

```sql
SELECT DISTINCT ON (p.category) p.category, p.name, SUM(l.quantity) AS quantity
FROM order_lines l
JOIN products p ON p.id = l.product_id
GROUP BY p.id
ORDER BY p.category, 3 DESC
```

### Company 9

> The webshop was down a few times. When? Show the first and last day of each period without any orders.

An extra outage: no orders from 2023-05-10 to 2023-05-12.

Broken:

```sql
SELECT * FROM (VALUES
  ('2023-08-14'::date, '2023-08-16'::date),
  ('2023-12-25', '2023-12-25'),
  ('2024-03-11', '2024-03-12'),
  ('2024-12-25', '2024-12-25'),
  ('2025-01-27', '2025-01-31'),
  ('2025-12-25', '2025-12-25')
) v(first_day, last_day)
```

Reference:

```sql
SELECT day + 1 AS first_day, next_day - 1 AS last_day
FROM (
  SELECT day, LEAD(day) OVER (ORDER BY day) AS next_day
  FROM (SELECT DISTINCT ordered_at::date AS day FROM orders) d
) x
WHERE next_day - day > 1
```

### Company 10

> Which order pushed the 2023 revenue over 50 million? Select the order id and customer name.

The May 2023 outage moves the order that crosses 50M.

Broken:

```sql
SELECT 253391 AS id, 'North Logistics & Co' AS name
```

Reference:

```sql
SELECT x.id, c.name
FROM (
  SELECT o.id, o.customer_id, o.ordered_at,
    SUM(SUM(l.quantity * l.unit_price)) OVER (ORDER BY o.ordered_at) AS running_total
  FROM orders o
  JOIN order_lines l ON l.order_id = o.id
  WHERE o.status = 'delivered' AND o.ordered_at < '2024-01-01'
  GROUP BY o.id
) x
JOIN customers c ON c.id = x.customer_id
WHERE x.running_total >= 50000000
ORDER BY x.ordered_at
LIMIT 1
```
