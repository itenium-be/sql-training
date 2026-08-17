-- Read only role that runs whatever SQL the players type in.
--
-- The game happily executes your SQL, so on a shared server a single
-- `TRUNCATE countries` used to ruin the exercises for the whole room.
-- Players connect as this role instead of as admin, which makes that
-- impossible rather than merely impolite.
--
-- Postgres only runs /docker-entrypoint-initdb.d on an empty data directory,
-- so an existing setup needs `docker compose down -v` to pick this up.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'player') THEN
    CREATE ROLE player LOGIN PASSWORD 'player';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE world TO player;
GRANT USAGE ON SCHEMA public TO player;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO player;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO player;

-- Belt and braces: even outside an explicit READ ONLY transaction this role
-- cannot write, and it cannot sit on a lock forever.
ALTER ROLE player SET default_transaction_read_only = on;
ALTER ROLE player SET statement_timeout = '10s';
ALTER ROLE player SET idle_in_transaction_session_timeout = '30s';
