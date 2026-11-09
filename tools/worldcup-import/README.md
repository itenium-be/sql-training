worldcup-import
===============

Append one World Cup to `sql-server/worldcup.sql` from the openfootball
[`worldcup.json`](https://github.com/openfootball/worldcup.json) dataset.

```sh
# fetch the tournament live and append in place
python3 tools/worldcup-import/worldcup_import.py 2030

# or from a local json, print instead of append
python3 tools/worldcup-import/worldcup_import.py 2030 --json wc2030.json --stdout
```

Tests: `python3 -m unittest` from this directory.

IDs continue from the current maxima in `worldcup.sql`, so the block appends
without renumbering existing rows. Re-running a year already in the file is
refused.

New entrants
------------
A team that has never appeared in a prior World Cup needs a `countries` and
`teams` row, which in turn needs a slug, 2-letter key and 3-letter code the
dataset does not carry. The run **stops** on an unknown team rather than guess;
add it to `NEW_COUNTRIES` in `worldcup_import.py` and re-run. `ALIASES` maps an
openfootball spelling (`USA`, `Ivory Coast`) to the name already in the file.

Scorers and player identity
---------------------------
openfootball goals carry only a scorer *name*, no stable player id. A new
tournament's scorer is matched to an existing `persons` row when **both the name
and the national team match** (`Lionel Messi` scoring for Argentina again reuses
his row). Name alone would merge namesakes; name+team keeps `COUNT(*) GROUP BY
person_id` leaderboards correct across editions. A name with no same-team history
mints a new person.

This does not repair splits already in the base dump — it holds both `Messi` and
`Lionel Messi`, and both `Mbappé` and `Kylian Mbappé`, as distinct persons. An
all-time top-scorer query still double-counts those; the importer simply stops
adding to the problem. `persons` is not a canonical registry.
