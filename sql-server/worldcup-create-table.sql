CREATE TABLE countries (
  id INT NOT NULL IDENTITY,
  [name] varchar(50) NOT NULL,
  slug varchar(50) NOT NULL,
  [key] varchar(10) NOT NULL,
  code varchar(10) NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE events (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [key] varchar(50) NOT NULL,
  season_id integer NOT NULL,
  [start_date] date NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);


CREATE TABLE events_teams (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  event_id integer NOT NULL,
  team_id integer NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);

CREATE TABLE goals (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  person_id integer NOT NULL,
  match_id integer NOT NULL,
  team_id integer NOT NULL,
  [minute] integer,
  offset integer DEFAULT 0 NOT NULL,
  score1 integer,
  score2 integer,
  penalty bit DEFAULT 0 NOT NULL,
  owngoal bit DEFAULT 0 NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);

CREATE TABLE groups (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  event_id integer NOT NULL,
  [name] varchar(20) NOT NULL,
  pos integer NOT NULL,
  [key] varchar(10),
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);


CREATE TABLE groups_teams (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  group_id integer NOT NULL,
  team_id integer NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);

CREATE TABLE matches (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [key] varchar(10),
  event_id integer NOT NULL,
  pos integer NOT NULL,
  num integer,
  team1_id integer NOT NULL,
  team2_id integer NOT NULL,
  round_id integer,
  group_id integer,
  [date] date,
  [time] varchar(10),
  score1 integer,
  score2 integer,
  score1et integer,
  score2et integer,
  score1p integer,
  score2p integer,
  score1i integer,
  score2i integer,
  score1ii integer,
  score2ii integer,
  next_match_id integer,
  prev_match_id integer,
  winner integer,
  winner90 integer,
  comments varchar(100),
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);


CREATE TABLE persons (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [key] varchar(50) NOT NULL,
  [name] varchar(100) NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL
);


CREATE TABLE rounds (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  event_id integer NOT NULL,
  [name] varchar(50) NOT NULL,
  pos integer NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL);


  CREATE TABLE seasons (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [key] varchar(10) NOT NULL,
  [name] varchar(10) NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL);


CREATE TABLE teams (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [key] varchar(10) NOT NULL,
  [name] varchar(50) NOT NULL,
  code varchar(10),
  country_id integer NOT NULL,
  created_at datetime2 NOT NULL,
  updated_at datetime2 NOT NULL);
