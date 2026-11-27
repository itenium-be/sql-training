#!/bin/bash
# Builds world_shadow: the real seeds plus shadow-postgres.sql, with the same player access as world.
set -euo pipefail

psql=(psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER")

# deploy.sh also runs this on existing volumes, where initdb no longer does.
if [ "$("${psql[@]}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'world_shadow'")" = 1 ]; then
  exit 0
fi
trap '"${psql[@]}" -d postgres -c "DROP DATABASE IF EXISTS world_shadow"' ERR
"${psql[@]}" -d postgres -c "CREATE DATABASE world_shadow"
for f in /docker-entrypoint-initdb.d/01-init.sql /docker-entrypoint-initdb.d/02-company.sql /shadow/shadow-postgres.sql /docker-entrypoint-initdb.d/04-hardening.sql; do
  "${psql[@]}" -d world_shadow -f "$f"
done
"${psql[@]}" -d world_shadow <<'SQL'
REVOKE ALL ON DATABASE world_shadow FROM PUBLIC;
GRANT CONNECT ON DATABASE world_shadow TO player;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO player;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO player;
ANALYZE;
SQL
