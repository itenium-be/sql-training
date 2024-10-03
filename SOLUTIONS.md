Solutions
=========

Countries
---------

- Give the name and the per capita GDP (no decimals) for all countries with a population of at least 200 million.
SELECT name, floor(gdp/population)
FROM countries
WHERE population>200000000


- Find the country that has all the vowels and no spaces in its name.
SELECT name
FROM countries
WHERE NOT name like '% %'
AND name like '%a%'
AND name like '%e%'
AND name like '%o%'
AND name like '%i%'
AND name like '%u%'


- For South America show population in millions and GDP in billions both to 2 decimal places.
SELECT name, round(population/1000000.0,2) as a, round(gdp/1000000000,2)
FROM countries
WHERE continent='South America'
ORDER BY gdp DESC


- Which countries have a GDP greater than every country in Europe?
SELECT name
FROM countries
WHERE gdp > (
  SELECT MAX(gdp)
  FROM countries
  WHERE continent='Europe'
)


- Find the largest country (by area) in each continent, show the continent, the name and the area.
SELECT continent, name, area
FROM countries
WHERE area = (
  SELECT MAX(area)
  FROM countries AS subquery
  WHERE subquery.continent = countries.continent
)
ORDER BY continent


- List the continents with the amount of countries in it, the country with the smallest area and its name, the total population and the rounded average gdp per capita.
SELECT
  continent,
  COUNT(name) AS countries,
  MIN(area) AS smallest,
  (SELECT name FROM countries WHERE area = MIN(c1.area) AND continent=c1.continent) AS smallest_name,
  SUM(population) AS total_population,
  ROUND(AVG(gdp/population)) AS avg_gdp
FROM countries c1
GROUP BY continent
ORDER BY continent


- Show the name and the population of each country in Europe. Also show the population as the rounded percentage of the population of Germany. Only take the countries where the population is at least 50% and sort by largest %.
SELECT name, population, ROUND(population * 100.0 / (SELECT population FROM countries WHERE name = 'Germany')) || '%' as per
FROM countries c
WHERE c.continent='Europe'
AND c.population*1.0/(SELECT c1.population FROM countries c1 WHERE name = 'Germany')>0.5
ORDER BY c.population*1.0/(SELECT c1.population FROM countries c1 WHERE name = 'Germany') DESC


- Get confusing top level domains: tld that start/end in a different country name.
SELECT c2.tld, STRING_AGG(c1.name, ',' ORDER BY c1.population DESC)
FROM countries c1
JOIN countries c2
ON (c1.name LIKE SUBSTRING(c2.tld FROM 2) || '%' OR c1.name LIKE '%' || SUBSTRING(c2.tld FROM 2))
AND c1.name != c2.name
GROUP BY c2.tld
HAVING COUNT(c1)>1
ORDER BY c2.tld



Teachers
--------

- Display the deparments and the number of staff
SELECT d.name, COUNT(t.id)
FROM departments d
LEFT JOIN teachers t ON t.dept = d.id
GROUP BY d.name


- List all teachers with their department. Display "None" if they do not belong to a department.
SELECT t.name, COALESCE(d.name, 'None') as dept_name
FROM teachers t
LEFT JOIN departments d ON t.dept=d.id


- Show the name of the teacher and, depending on the department, show "Sci", "Art" or "None".
SELECT t.name,
  CASE 
    WHEN d.name = 'Computing' THEN 'Sci'
    WHEN d.name = 'Design' THEN 'Art'
    WHEN d.name = 'Engineering' THEN 'Sci'
    ELSE 'None'
  END AS department_type
FROM teachers t
LEFT JOIN departments d ON t.dept = d.id


- Show all teachers and their mobile number. If they don't have one, fallback to their extension and if they don't have an office, fallback to the department extension. We need to be able to call them right away, so phone numbers must start with +32 and be without any spaces. The school number is 09 331 0000
SELECT t.name,
  CASE
    WHEN t.mobile IS NOT NULL THEN
      CONCAT('+32', REPLACE(SUBSTRING(t.mobile, 2), ' ', ''))
    ELSE '+329331' || REPLACE(COALESCE(t.phone, d.phone), 'EXT ', '')
  END AS contact_number
FROM teachers t
LEFT JOIN departments d ON t.dept = d.id


- Select all teacher with a name starting with "S" and their seniority (in years)
SELECT t.name, EXTRACT(YEAR FROM AGE(NOW(), t.employed_at)) AS seniority
FROM teachers t
WHERE t.name LIKE 'S%'


- Show the teacher names with a birthday today (3/10)
SELECT name
FROM teachers
WHERE DATE_PART('day', birth_date) = DATE_PART('day', CURRENT_DATE)
  AND DATE_PART('month', birth_date) = DATE_PART('month', CURRENT_DATE)


- Select the department and the top 2 owners with their salary (include department-less teachers). Sort by department and highest salary.
WITH teach_sal AS
(SELECT name, salary, dept,
  RANK() OVER(PARTITION BY dept ORDER BY salary DESC) AS rownum
  FROM teachers)
SELECT d.name dept, t.name, salary FROM teach_sal t
LEFT JOIN departments d ON t.dept=d.id WHERE rownum<3
ORDER BY dept, salary DESC


- Looking at the result of the previous exercise, there was only one record for the "Design" department. Adjust the query so that it adds an extra Design row with NULL values.
WITH teach_sal AS
(SELECT name, salary, dept,
  RANK() OVER(PARTITION BY dept ORDER BY salary DESC) AS rownum
  FROM teachers)
SELECT d.name dept, t.name, salary FROM teach_sal t
LEFT JOIN departments d ON t.dept=d.id WHERE rownum<3
UNION
SELECT 'Design' as dept, null as name, null as salary
ORDER BY dept, salary DESC NULLS LAST


Worldcup
--------

- Which team was always present?
SELECT t.name
from events_teams e join teams t on e.team_id=t.id
group by t.name
having count(0)=(SELECT COUNT(*) FROM events)


- Which country has "scored" the most ungoals?
SELECT TOP 1 c.name, COUNT(g.id) AS owngoals
FROM goals g
JOIN teams t ON g.team_id = t.id
JOIN countries c ON t.country_id = c.id
WHERE g.owngoal = 1
GROUP BY c.name
ORDER BY owngoals DESC


- Select the year of the worldcup in which the most penalties were score
SELECT TOP 1 s.name, COUNT(g.id) AS penalty_count
FROM events e
JOIN matches m ON e.id = m.event_id
JOIN goals g ON g.match_id = m.id
JOIN seasons s ON s.id=e.season_id
WHERE g.penalty = 1
GROUP BY s.name
ORDER BY penalty_count DESC


- Find players that played for different countries and a "," separated list of countries he played for
SELECT player, STRING_AGG(country, ',') AS countries
FROM (
    SELECT p.name as player, c.name as country
    FROM persons p
    JOIN goals g ON p.id = g.person_id
    JOIN teams t ON g.team_id = t.id
    JOIN countries c ON t.country_id = c.id
    GROUP BY p.name, c.name
) AS subquery
GROUP BY player
HAVING COUNT(DISTINCT country) > 1


- Which countries always survived the "Group Stage" when present? (A round not called "Matchday")
SELECT c.name, COUNT(DISTINCT et.event_id) AS survived_count
FROM countries c
JOIN teams t ON c.id = t.country_id
JOIN events_teams et ON t.id = et.team_id
JOIN matches m ON m.event_id = et.event_id AND (m.team1_id = t.id OR m.team2_id = t.id)
JOIN rounds r ON m.round_id = r.id AND r.event_id = et.event_id
WHERE r.name NOT LIKE 'Matchday%'
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT et.event_id) = (SELECT COUNT(DISTINCT e.id) 
                                      FROM events e
                                      JOIN events_teams et2 ON et2.event_id = e.id
                                      JOIN teams t2 ON t2.id = et2.team_id
                                      WHERE t2.country_id = c.id);

- For the player that scored the most goals, list the worldcup.YYYY, the round name, the match date, the goal minute, scored Y/N and the total amount of goals scored so far. To keep things "simple", evaluate only events.id 20, 21 and 22 and team.id 1.
WITH top_scorer AS (
  SELECT TOP 1 p.id AS player_id
  FROM persons p
  JOIN goals g ON p.id = g.person_id
  GROUP BY p.id, p.name
  ORDER BY COUNT(g.id) DESC
)
select e.[key], r.name, CONVERT(VARCHAR(10), m.date, 23), g.minute, CASE WHEN g.id IS NOT NULL THEN 'Y' ELSE 'N' END AS scored,
	SUM(CASE WHEN g.id IS NOT NULL THEN 1 ELSE 0 END) OVER (ORDER BY m.id) AS total_scored_so_far
from matches m
join events e on m.event_id=e.id
join rounds r on m.round_id=r.id
left join goals g on g.match_id=m.id and person_id=(select player_id from top_scorer)
where e.id in (20, 21, 22)  and (m.team1_id=1 or m.team2_id=1)
order by m.date
