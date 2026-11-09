-- Demo players and scores for reviewing the leaderboard / beamer.
-- Not part of initdb; run by hand against the leaderboard DB:
--   docker compose exec -T leaderboard-db psql -U admin -d game < sql-data/seed-demo.sql
-- (dev also exposes it on localhost:6000). Re-runnable: existing rows are kept.

INSERT INTO players (name, avatar) VALUES
  ('Mehdi', 1), ('Lena', 2), ('Sofie', 3), ('Jonas', 4),
  ('Camille', 5), ('Wouter', 6), ('Amira', 7), ('Thomas', 8)
ON CONFLICT DO NOTHING;

INSERT INTO game_progress (player, game, exerciseId, solution, solutionLength, elapsed, cost, points, hint, expected, attempts) VALUES
  -- World: Mehdi near-complete and fast, others trailing
  ('Mehdi',   'World', 1, 'seed', 84,  38,  4, 3, false, false, 0),
  ('Mehdi',   'World', 2, 'seed', 71,  62,  3, 3, false, false, 0),
  ('Mehdi',   'World', 3, 'seed', 131, 150, 6, 5, false, false, 0),
  ('Mehdi',   'World', 4, 'seed', 96,  125, 9, 6, false, false, 1),
  ('Mehdi',   'World', 5, 'seed', 128, 220, 7, 6, false, false, 0),
  ('Mehdi',   'World', 6, 'seed', 54,  98,  4, 7, false, false, 0),
  ('Mehdi',   'World', 7, 'seed', 140, 131, 8, 8, false, false, 2),
  ('Mehdi',   'World', 8, 'seed', 176, 172, 11, 9, false, false, 1),
  ('Lena',    'World', 1, 'seed', 90,  55,  5, 3, false, false, 0),
  ('Lena',    'World', 2, 'seed', 77,  70,  4, 3, false, false, 1),
  ('Lena',    'World', 3, 'seed', 118, 165, 5, 5, false, false, 0),
  ('Lena',    'World', 4, 'seed', 110, 140, 10, 6, false, false, 0),
  ('Lena',    'World', 5, 'seed', 120, 80,  6, 6, true,  false, 0),
  ('Lena',    'World', 6, 'seed', 62,  120, 5, 7, false, false, 1),
  ('Lena',    'World', 7, 'seed', 150, 200, 9, 8, false, false, 0),
  ('Sofie',   'World', 1, 'seed', 95,  72,  3, 3, false, false, 0),
  ('Sofie',   'World', 2, 'seed', 80,  90,  5, 3, false, false, 0),
  ('Sofie',   'World', 3, 'seed', 140, 150, 7, 5, false, false, 2),
  ('Sofie',   'World', 4, 'seed', 105, 160, 11, 6, false, false, 0),
  ('Sofie',   'World', 5, 'seed', 135, 184, 8, 6, false, false, 0),
  ('Sofie',   'World', 7, 'seed', 103, 211, 7, 8, false, false, 1),
  ('Jonas',   'World', 1, 'seed', 92,  60,  6, 3, false, false, 0),
  ('Jonas',   'World', 2, 'seed', 83,  110, 5, 3, false, false, 0),
  ('Jonas',   'World', 3, 'seed', 125, 104, 8, 5, false, false, 0),
  ('Jonas',   'World', 5, 'seed', 88,  140, 6, 6, false, false, 1),
  ('Jonas',   'World', 7, 'seed', 160, 220, 10, 8, false, false, 0),
  ('Camille', 'World', 1, 'seed', 100, 88,  5, 3, false, false, 0),
  ('Camille', 'World', 2, 'seed', 61,  130, 4, 3, false, false, 0),
  ('Camille', 'World', 4, 'seed', 96,  175, 9, 6, false, false, 0),
  ('Camille', 'World', 5, 'seed', 150, 240, 12, 6, false, false, 2),
  ('Camille', 'World', 8, 'seed', 142, 300, 13, 9, false, false, 0),
  ('Wouter',  'World', 1, 'seed', 104, 112, 5, 3, false, false, 0),
  ('Wouter',  'World', 2, 'seed', 97,  51,  4, 3, false, false, 0),
  ('Wouter',  'World', 3, 'seed', 150, 151, 3, 5, false, false, 1),
  ('Wouter',  'World', 5, 'seed', 160, 190, 8, 6, false, false, 0),
  ('Wouter',  'World', 8, 'seed', 160, 252, 10, 9, false, false, 3),
  ('Amira',   'World', 1, 'seed', 110, 95,  7, 3, false, false, 0),
  ('Amira',   'World', 3, 'seed', 160, 180, 9, 5, false, false, 0),
  ('Amira',   'World', 6, 'seed', 80,  150, 6, 7, false, false, 1),
  ('Amira',   'World', 8, 'seed', 190, 280, 14, 9, false, false, 0),
  ('Thomas',  'World', 1, 'seed', 120, 130, 8, 3, false, false, 2),
  ('Thomas',  'World', 2, 'seed', 99,  160, 6, 3, false, false, 0),
  ('Thomas',  'World', 5, 'seed', 170, 210, 9, 6, false, false, 0),
  -- Teachers: a smaller, varied spread
  ('Mehdi',   'Teachers', 1, 'seed', 70,  65,  4, 3, false, false, 0),
  ('Mehdi',   'Teachers', 2, 'seed', 120, 140, 7, 6, false, false, 0),
  ('Lena',    'Teachers', 1, 'seed', 66,  80,  3, 3, false, false, 0),
  ('Lena',    'Teachers', 3, 'seed', 140, 150, 8, 5, false, false, 1),
  ('Sofie',   'Teachers', 1, 'seed', 72,  90,  5, 3, false, false, 0),
  ('Sofie',   'Teachers', 2, 'seed', 130, 160, 9, 6, false, false, 0),
  ('Wouter',  'Teachers', 1, 'seed', 68,  70,  4, 3, false, false, 0),
  ('Wouter',  'Teachers', 4, 'seed', 155, 180, 6, 7, false, false, 0),
  ('Jonas',   'Teachers', 2, 'seed', 125, 120, 8, 6, false, false, 0),
  -- Worldcup: a few high-value solves
  ('Mehdi',   'Worldcup', 1, 'seed', 150, 180, 12, 9, false, false, 0),
  ('Mehdi',   'Worldcup', 2, 'seed', 180, 240, 15, 12, false, false, 1),
  ('Lena',    'Worldcup', 1, 'seed', 160, 200, 10, 9, false, false, 0),
  ('Sofie',   'Worldcup', 1, 'seed', 170, 220, 14, 9, false, false, 0),
  ('Jonas',   'Worldcup', 2, 'seed', 175, 210, 13, 12, false, false, 0)
ON CONFLICT DO NOTHING;
