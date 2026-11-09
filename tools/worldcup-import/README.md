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

Known trade-off: scorers
------------------------
openfootball goals carry only a scorer *name*, no stable player id, so a player
cannot be matched to the same person across tournaments without fragile
name-matching that would merge namesakes. The importer therefore creates fresh
`persons` rows per tournament — a repeat scorer (Messi, Mbappé) gets a new id
each edition. This mirrors the base dump, which is itself inconsistent (it holds
both `Messi` and `Lionel Messi`). Acceptable for a JOIN-practice dataset; do not
treat `persons` as a canonical registry.
