-- Leaderboard postgres DB

CREATE TABLE game_progress (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0),
  solution VARCHAR(900),
  solutionLength NUMERIC(15,0),
  elapsed NUMERIC(15,0)
);

CREATE TABLE game_start (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0),
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
