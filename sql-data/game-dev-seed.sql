-- Dev-only seed so the admin page has something to look at. Mounted into the
-- leaderboard DB's initdb by compose.dev.yaml; runs once on a fresh volume
-- (recreate with `docker compose down -v`). Timestamps are relative to seed
-- time, so the Players tab's typing dots read live for a few minutes after.

INSERT INTO players (name, avatar) VALUES
  ('Nora', 5), ('Sam', 12), ('Mila', 17), ('Tibo', 8), ('Lena', 21), ('Jo', 3), ('Wim', NULL);

-- Solved exercises (game_progress). solution text shows on the Exercises tab.
INSERT INTO game_progress (player, game, exerciseId, solution, solutionLength, elapsed, cost, points, hint, expected, attempts) VALUES
  ('Nora','World',1,'SELECT name, FLOOR(gdp/population) FROM world WHERE population >= 200000000',62,41,3,80,FALSE,FALSE,0),
  ('Nora','World',2,'SELECT name FROM world WHERE name ~* ''^[^aeiou ]*[aeiou][^aeiou ]*''',55,70,4,70,FALSE,FALSE,0),
  ('Nora','World',3,'SELECT name, ROUND(population/1e6,2), ROUND(gdp/1e9,2) FROM world WHERE continent=''South America'' ORDER BY gdp DESC',96,51,5,90,FALSE,FALSE,0),
  ('Nora','World',4,'SELECT name FROM world WHERE gdp > ALL(SELECT gdp FROM world WHERE continent=''Europe'' AND gdp>0)',88,88,6,85,FALSE,FALSE,1),
  ('Nora','World',5,'SELECT continent, name, area FROM world x WHERE area = (SELECT MAX(area) FROM world y WHERE x.continent=y.continent)',104,120,7,95,FALSE,FALSE,0),
  ('Nora','World',6,'SELECT continent, COUNT(*) FROM world GROUP BY continent',53,160,9,100,FALSE,FALSE,0),
  ('Nora','World',7,'SELECT name, population FROM world WHERE continent=''Europe''',48,140,8,90,FALSE,FALSE,0),
  ('Nora','World',8,'SELECT tld FROM world',21,190,11,100,FALSE,FALSE,0),

  ('Sam','World',1,'SELECT name, FLOOR(gdp/population) AS g FROM world WHERE population>=200000000',58,55,4,80,FALSE,FALSE,0),
  ('Sam','World',2,'SELECT name FROM world WHERE name !~ '' '' AND name ~* ''a'' AND name ~* ''e''',72,110,6,65,TRUE,FALSE,1),
  ('Sam','World',3,'SELECT name, ROUND(population/1000000.0,2), ROUND(gdp/1000000000.0,2) FROM world WHERE continent=''South America'' ORDER BY gdp DESC',128,95,6,80,FALSE,FALSE,0),
  ('Sam','World',4,'SELECT name FROM world WHERE gdp>(SELECT MAX(gdp) FROM world WHERE continent=''Europe'')',80,130,8,75,FALSE,FALSE,2),
  ('Sam','World',5,'SELECT continent, name, area FROM world x WHERE area=(SELECT MAX(area) FROM world y WHERE y.continent=x.continent)',110,145,7,85,FALSE,FALSE,0),

  ('Mila','World',1,'SELECT name, FLOOR(gdp/population) FROM world WHERE population>=200000000',60,62,3,80,FALSE,FALSE,0),
  ('Mila','World',2,'SELECT name FROM world WHERE name ~* ''^[^aeiou ]*[aeiou]+[^aeiou ]*$''',57,88,5,70,FALSE,FALSE,0),
  ('Mila','World',3,'SELECT name, ROUND(population/1e6,2), ROUND(gdp/1e9,2) FROM world WHERE continent=''South America'' ORDER BY gdp DESC',96,120,5,90,FALSE,FALSE,0),
  ('Mila','World',4,'SELECT name FROM world WHERE gdp>ALL(SELECT gdp FROM world WHERE continent=''Europe'')',78,150,6,70,TRUE,FALSE,1),
  ('Mila','World',5,'SELECT continent, name, area FROM world x WHERE area=(SELECT MAX(area) FROM world y WHERE x.continent=y.continent)',108,170,8,85,FALSE,FALSE,0),
  ('Mila','World',6,'SELECT continent, COUNT(*) AS c FROM world GROUP BY continent ORDER BY continent',72,210,10,100,FALSE,FALSE,1),

  ('Tibo','World',1,'SELECT name, FLOOR(gdp/population) FROM world WHERE population>=200000000',60,75,4,80,FALSE,FALSE,1),
  ('Tibo','World',2,'SELECT name FROM world WHERE name ~* ''^[bcdfghjklmnpqrstvwxyz]*[aeiou][bcdfghjklmnpqrstvwxyz]*$''',92,130,5,65,FALSE,FALSE,0),
  ('Tibo','World',3,'SELECT name, ROUND(population/1e6,2), ROUND(gdp/1e9,2) FROM world WHERE continent=''South America'' ORDER BY gdp DESC',96,150,6,90,FALSE,FALSE,0),
  ('Tibo','World',4,'SELECT name FROM world WHERE gdp>ALL(SELECT gdp FROM world WHERE continent=''Europe'' AND gdp IS NOT NULL)',101,180,7,75,FALSE,FALSE,2),

  ('Lena','World',1,'SELECT name, FLOOR(gdp/population) FROM world WHERE population>=200000000',60,98,4,80,TRUE,FALSE,2),
  ('Lena','World',2,'SELECT name FROM world WHERE name ~* ''^[^aeiou ]*[aeiou][^aeiou ]*$''',57,160,5,70,FALSE,FALSE,0),
  ('Lena','World',3,'SELECT name, ROUND(population/1e6,2), ROUND(gdp/1e9,2) FROM world WHERE continent=''South America'' ORDER BY gdp DESC',96,200,6,90,TRUE,FALSE,1),

  ('Jo','World',1,'SELECT name, FLOOR(gdp/population) FROM world WHERE population>=200000000',60,140,4,80,TRUE,FALSE,3),
  ('Jo','World',2,'SELECT name FROM world WHERE name ~* ''^[^aeiou ]*[aeiou][^aeiou ]*$''',57,260,5,70,FALSE,FALSE,1);

-- When each player first opened an exercise (drives "Running" and the room-stuck table).
INSERT INTO game_start (player, game, exerciseId, startTime) VALUES
  ('Nora','World',8, NOW() - INTERVAL '4 minutes'),
  ('Sam','World',6, NOW() - INTERVAL '3 minutes'),  ('Sam','World',7, NOW() - INTERVAL '5 minutes'),
  ('Mila','World',7, NOW() - INTERVAL '2 minutes'),
  ('Tibo','World',5, NOW() - INTERVAL '70 seconds'),('Tibo','World',6, NOW() - INTERVAL '4 minutes'),
  ('Lena','World',4, NOW() - INTERVAL '90 seconds'),
  ('Jo','World',3, NOW() - INTERVAL '6 minutes');

-- Wrong attempts (feed + the Players "Wrong" column).
INSERT INTO submissions (player, game, exerciseId, solution, correct, message, submittedAt) VALUES
  ('Sam','World',7,'SELECT name, population FROM world WHERE continent=Europe', FALSE, 'column "europe" does not exist', NOW() - INTERVAL '40 seconds'),
  ('Sam','World',7,'SELECT name population FROM world', FALSE, 'syntax error at or near "population"', NOW() - INTERVAL '150 seconds'),
  ('Sam','World',7,'SELECT * FROM world WHERE continent=''Europe''', FALSE, 'wrong columns', NOW() - INTERVAL '280 seconds'),
  ('Tibo','World',6,'SELECT continent, count(*) FROM world', FALSE, 'must appear in GROUP BY', NOW() - INTERVAL '20 seconds'),
  ('Tibo','World',6,'SELECT continent FROM world GROUP BY continent', FALSE, 'missing count', NOW() - INTERVAL '95 seconds'),
  ('Jo','World',3,'SELECT name FROM world WHERE continent=''South America''', FALSE, 'wrong columns', NOW() - INTERVAL '340 seconds'),
  ('Nora','World',8,'SELECT tld FROM world', TRUE, NULL, NOW() - INTERVAL '15 seconds'),
  ('Mila','World',6,'SELECT continent, COUNT(*) AS c FROM world GROUP BY continent ORDER BY continent', TRUE, NULL, NOW() - INTERVAL '30 seconds'),
  ('Sam','World',5,'SELECT continent, name, area FROM world x WHERE area=(SELECT MAX(area) FROM world y WHERE y.continent=x.continent)', TRUE, NULL, NOW() - INTERVAL '50 seconds');

-- Typing activity: the signal that separates "head down" from "gone quiet".
INSERT INTO exercise_activity (player, game, exerciseId, attempts, hint, lastActiveAt) VALUES
  ('Sam','World',7,3,FALSE, NOW() - INTERVAL '8 seconds'),
  ('Sam','World',6,0,FALSE, NOW() - INTERVAL '95 seconds'),
  ('Mila','World',7,0,FALSE, NOW() - INTERVAL '18 seconds'),
  ('Tibo','World',6,5,FALSE, NOW() - INTERVAL '3 seconds'),
  ('Tibo','World',5,0,FALSE, NOW() - INTERVAL '65 seconds'),
  ('Lena','World',4,1,TRUE,  NOW() - INTERVAL '12 seconds'),
  ('Jo','World',3,1,FALSE,   NOW() - INTERVAL '6 minutes');
