# Wait to be sure that SQL Server came up
sleep 90s

sqlcmd() { /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P password123! -d master "$@"; }

# Runs on every container start: the shadow deltas are not idempotent.
missing() { [ "$(sqlcmd -h -1 -W -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID('$1') IS NULL THEN 1 ELSE 0 END")" = 1 ]; }

missing sportdb && sqlcmd -v DB=sportdb -i worldcup.sql
missing sportdb_shadow && sqlcmd -v DB=sportdb_shadow -i worldcup.sql,shadow-worldcup.sql
sqlcmd -i player.sql
