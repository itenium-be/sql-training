-- Leaderboard postgres DB

CREATE TABLE game_progress (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0),
  solution VARCHAR(900),
  solutionLength NUMERIC(15,0),
  elapsed NUMERIC(15,0),
  cost NUMERIC(15,0),
  points NUMERIC(15,0),
  hint BOOLEAN NOT NULL DEFAULT FALSE,
  expected BOOLEAN NOT NULL DEFAULT FALSE,
  attempts NUMERIC(15,0) NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX game_progress_unique ON game_progress (player, game, exerciseId);

CREATE TABLE exercise_activity (
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0) NOT NULL,
  attempts NUMERIC(15,0) NOT NULL DEFAULT 0,
  hint BOOLEAN NOT NULL DEFAULT FALSE,
  expected BOOLEAN NOT NULL DEFAULT FALSE,
  lastActiveAt TIMESTAMP,
  PRIMARY KEY (player, game, exerciseId)
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0) NOT NULL,
  solution TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  message TEXT,
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE game_start (
  id SERIAL PRIMARY KEY,
  player VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  exerciseId NUMERIC(15,0),
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar SMALLINT,
  registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX players_name_unique ON players (LOWER(name));
