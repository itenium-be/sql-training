---
name: import-worldcup
description: Add a new World Cup (e.g. 2030) to the sql-training sportdb dataset from openfootball. Use when worldcup.sql is missing a tournament.
---

# Import a World Cup into sportdb

`sql-server/worldcup.sql` is a static MSSQL dump of the openfootball World Cup
data (seasons 1930–latest). To add a tournament, generate an append-only block
with `tools/worldcup-import`.

## Steps

1. **Run the importer** (fetches `worldcup.json` for the year and appends):
   ```sh
   python3 tools/worldcup-import/worldcup_import.py <year>
   ```
   It reads the current max id per table from `worldcup.sql`, so the block
   continues the id sequence and never renumbers existing rows.

2. **If it stops on an unknown team** (`unknown team 'X'`): X is a World Cup
   debutant. Add it to `NEW_COUNTRIES` in `worldcup_import.py` with its slug,
   2-letter key and 3-letter FIFA code, then re-run. If it stops because a name
   differs from the file's spelling, add an `ALIASES` entry instead.

3. **Verify** against a throwaway SQL Server before trusting the append — load
   the full file and sanity-check counts and referential integrity:
   ```sh
   docker run -d --name wc-verify -e ACCEPT_EULA=Y -e 'MSSQL_SA_PASSWORD=password123!' \
     -e MSSQL_PID=Express -p 14399:1433 mcr.microsoft.com/mssql/server:2025-latest
   # wait for ready, then:
   docker cp sql-server/worldcup.sql wc-verify:/tmp/wc.sql
   docker exec wc-verify /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa \
     -P 'password123!' -d master -i /tmp/wc.sql   # expect zero Msg NNN errors
   ```
   Expected shape of a 48-team edition: 104 matches (72 group + 32 knockout),
   48 events_teams, 12 groups of 4, no orphan `team_id`/`person_id`. Spot-check
   the champion (final winner) and top scorers against the real tournament.

4. **Run the unit tests** after any code change:
   ```sh
   cd tools/worldcup-import && python3 -m unittest
   ```

## Notes

- `next_match_id`/`prev_match_id` are NULL throughout the base dump; the importer
  leaves them NULL (openfootball carries no bracket linkage).
- Scorers become fresh `persons` rows each edition — see the tool's README for
  why cross-tournament dedup is not attempted.
- A 32-team edition (pre-2026) yields 64 matches, 8 groups; the importer adapts
  to whatever the json contains, so the only per-year work is new entrants.
