-- Leaderboard postgres DB

CREATE TABLE game_progress (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0),
  solution TEXT,
  solutionLength NUMERIC(15,0),
  elapsed NUMERIC(15,0),
  -- How many times they hit Submit before getting it right (1 = first try).
  attempts NUMERIC(15,0) DEFAULT 1,
  -- Whether the expected result was revealed before solving it.
  hintsUsed NUMERIC(15,0) DEFAULT 0,
  -- Work the database had to do. Load independent, so a busy server
  -- never changes anybody's score. Lower is better.
  reads NUMERIC(15,0) DEFAULT 0,
  plannerCost NUMERIC(15,0) DEFAULT 0,
  rowsScanned NUMERIC(15,0) DEFAULT 0
);

CREATE TABLE game_start (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0),
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
