-- Shadow data for Worldcup (database sportdb_shadow), applied on top of worldcup.sql.
-- A submission only counts when it is also correct on this data, so every exercise must give a
-- different, non-empty result here (bun run verify-solutions checks that). Never shown to players.

USE [sportdb_shadow];
GO

-- WC1: Argentina joins Brazil in every World Cup
INSERT INTO events_teams (event_id, team_id, created_at, updated_at)
SELECT e.id, 1, SYSUTCDATETIME(), SYSUTCDATETIME()
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM events_teams et WHERE et.event_id = e.id AND et.team_id = 1);

-- WC2: Australia overtakes France
UPDATE TOP (3) goals SET owngoal = 1 WHERE team_id = 45 AND owngoal = 0 AND penalty = 0;

-- WC3: 2022 overtakes 2018
UPDATE TOP (8) goals SET penalty = 1
WHERE penalty = 0 AND owngoal = 0 AND team_id <> 1 AND match_id IN (SELECT id FROM matches WHERE event_id = 22);

-- WC4: someone who only scored for one country also scores for Brazil
UPDATE goals SET team_id = 6
WHERE id = (
  SELECT MIN(g.id) FROM goals g
  WHERE g.owngoal = 0 AND g.team_id NOT IN (1, 6)
    AND g.person_id IN (SELECT person_id FROM goals GROUP BY person_id HAVING COUNT(*) > 1 AND COUNT(DISTINCT team_id) = 1)
);

-- WC5: the Netherlands at the 1930 World Cup, without surviving the group stage
INSERT INTO events_teams (event_id, team_id, created_at, updated_at)
SELECT 1, t.id, SYSUTCDATETIME(), SYSUTCDATETIME() FROM teams t WHERE t.name = 'Netherlands';

-- WC6: Messi gets Álvarez's first goal of 2014-2022
UPDATE goals SET person_id = 230
WHERE id = (
  SELECT MIN(g.id) FROM goals g JOIN matches m ON m.id = g.match_id
  WHERE m.event_id IN (20, 21, 22) AND g.team_id = 1 AND g.person_id = 442
);

-- WC7: Jordan already played in 2022
INSERT INTO events_teams (event_id, team_id, created_at, updated_at)
SELECT 22, t.id, SYSUTCDATETIME(), SYSUTCDATETIME() FROM teams t WHERE t.name = 'Jordan';
GO
