-- Every player connects as the same role, and a role can read the query text of its own other sessions.
REVOKE SELECT ON pg_catalog.pg_stat_activity FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pg_catalog.pg_stat_get_activity(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pg_catalog.pg_stat_get_backend_activity(integer) FROM PUBLIC;
