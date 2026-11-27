# Anti-cheat: shadow databases

[Issue #8](https://github.com/itenium-be/sql-training/issues/8). A submission is scored only on
the rows it returns, so a hardcoded answer (`SELECT 'Mozambique'`) or wrong logic that happens to
fit the data both pass. Every correct submission is run a second time on a shadow copy of the
data with different contents, and it counts only if it is correct there too.

## Shadow databases

| Engine   | Real      | Shadow           | Built from                                                                    |
| -------- | --------- | ---------------- | ----------------------------------------------------------------------------- |
| Postgres | `world`   | `world_shadow`   | `postgres.sql` + `postgres-company.sql`, then `shadow-postgres.sql`            |
| MSSQL    | `sportdb` | `sportdb_shadow` | `worldcup.sql` with the db name as sqlcmd variable `$(DB)`, then `shadow-worldcup.sql` |

- Separate databases, not schemas, so qualified names cannot reach the real data. Postgres cannot
  query across databases. On MSSQL a `shadow` login maps only to `sportdb_shadow`, and `player`
  has no user there, so a 3-part name fails in either direction.
- `player` (pg) gets the same read-only grants on `world_shadow` as on `world`.
- Each shadow database is built only when it is missing: on pg by the initdb script
  `postgres-shadow.sh`, which `deploy.sh` also runs on existing volumes, and on MSSQL by
  `run-initialization.sh` at container start. To apply a changed delta, drop the shadow database
  and redeploy.

## Shadow data

The shadow delta scripts edit the real seed. Per exercise they add:

- **Decoys** that catch a likely wrong filter. Examples: for World 2, a spaceless name with every
  vowel except `e` and one with every vowel except `a`. For Teachers 3, a fourth department. For
  World 5, a continent whose largest-area check breaks `area > 0`.
- **Perturbations** (changed values, added or deleted rows), so every exercise's result differs
  from the real one.

Constraints:

- Every solution's shadow result is non-empty and differs from its real `expected`.
- `expectedOrder` / `LIMIT` / `TOP` exercises get no new ties on their ordering keys.
- Teachers 8 asks to add a Design row "because there was only one", so Design keeps exactly one
  teacher.

## Check flow

`checkSolution`:

1. Run the query on the real data and compare it with `expected`. These rows are what the player
   sees.
2. Only if that matches, run it on the shadow data and compare it with the shadow expected result.
   That result comes from running the exercise's `solution` on the shadow data, cached per exercise
   per day, the same way `dynamic` exercises are.
3. A shadow mismatch or a shadow error gives `correct: false` with the message
   "Right result, but your query wouldn't give the right result on other data." Shadow rows are
   never returned.

`measureCost` and the "show expected" hint stay on the real data. `runQuery` takes a target
(`real` | `shadow`).

## Testing

- `bun test`, with the query runner faked in `checkSolution`:
  - real and shadow both match: correct
  - real matches, shadow does not: incorrect, the shadow message, the real rows
  - the shadow run throws: incorrect, the shadow message
  - real does not match: the shadow query never runs
- `bun run verify-solutions` against the live databases:
  - every solution's shadow result is non-empty and differs from the real expected result
  - every query in the `knownCheats` fixture is scored incorrect. The fixture holds `SELECT 8`
    style hardcodes, the two World 2 vowel queries from the issue, Teachers 3
    `WHEN d.id IS NOT NULL THEN 'Sci'` and World 5 `area > 0` inside `>= ALL (…)`.
