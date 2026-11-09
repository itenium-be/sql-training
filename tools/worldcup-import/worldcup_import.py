"""Generate an append-only MSSQL block that adds one World Cup to sportdb.

Reads the openfootball `worldcup.json` for a year and emits INSERT statements
that extend `sql-server/worldcup.sql` with that tournament: new countries/teams
for debutants, the season/event, groups, rounds, matches, scorers and goals.
IDs continue from the current maxima so the block appends without renumbering.

Run again for the next tournament; see README.md and the import-worldcup skill.
"""

import argparse
import csv
import json
import re
import sys
import unicodedata
import urllib.request

SOURCE_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/{year}/worldcup.json"

# openfootball team name -> the country [name] already in worldcup.sql
ALIASES = {
    "USA": "United States",
    "Ivory Coast": "Côte d'Ivoire",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
}

# Teams never in a prior World Cup: name -> (slug, 2-letter key, 3-letter code).
# A team that is neither already present nor listed here stops the run on purpose
# (see the skill): a new entrant needs a human to confirm its codes.
NEW_COUNTRIES = {
    "Cape Verde": ("cape-verde", "cv", "CPV"),
    "Curaçao": ("curacao", "cw", "CUW"),
    "DR Congo": ("dr-congo", "cd", "COD"),
    "Jordan": ("jordan", "jo", "JOR"),
    "Uzbekistan": ("uzbekistan", "uz", "UZB"),
}

TABLES = [
    "countries", "seasons", "teams", "events", "events_teams", "groups",
    "groups_teams", "rounds", "matches", "persons", "goals",
]


def parse_minute(text):
    if "+" in text:
        base, off = text.split("+", 1)
        return int(base), int(off)
    return int(text), 0


def slugify(name):
    norm = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", norm.lower())


def strip_time(text):
    return text.split()[0] if text else text


def _cmp(a, b):
    return 1 if a > b else 2 if a < b else 0


def match_outcome(score):
    ft = score["ft"]
    decisive = score.get("p") or score.get("et") or ft
    return _cmp(decisive[0], decisive[1]), _cmp(ft[0], ft[1])


def _rows(sql, table):
    """Every value tuple of `table`, as lists of raw field strings."""
    out = []
    for m in re.finditer(
        r"INSERT INTO " + table + r" \([^)]*\)\s*VALUES\s*(.*?);",
        sql, re.S,
    ):
        for line in m.group(1).splitlines():
            line = line.strip()
            if line.startswith("("):
                body = line.rstrip(",").strip()[1:-1]
                out.append(next(csv.reader([body], quotechar="'", skipinitialspace=True)))
    return out


class Existing:
    def __init__(self, sql):
        self.maxid = {}
        for t in TABLES:
            ids = [int(r[0]) for r in _rows(sql, t) if r and r[0].isdigit()]
            self.maxid[t] = max(ids, default=0)
        self._country_by_name = {r[1]: int(r[0]) for r in _rows(sql, "countries")}
        self._team_by_country = {int(r[4]): int(r[0]) for r in _rows(sql, "teams")}
        self.person_keys = {r[1] for r in _rows(sql, "persons")}
        self.season_keys = {r[1] for r in _rows(sql, "seasons")}
        # A scorer is the same player as an existing person only when both the
        # name and the national team match; name alone would merge namesakes.
        id_to_name = {int(r[0]): r[2] for r in _rows(sql, "persons")}
        self._person_by_name_team = {}
        for r in _rows(sql, "goals"):
            name = id_to_name.get(int(r[1]))
            if name is not None:
                self._person_by_name_team.setdefault((name, int(r[3])), int(r[1]))

    def country_id(self, name):
        return self._country_by_name.get(ALIASES.get(name, name))

    def team_id_for_country(self, country_id):
        return self._team_by_country.get(country_id)

    def existing_person(self, name, team_id):
        return self._person_by_name_team.get((name, team_id))


def parse_existing(sql):
    return Existing(sql)


def _sql_str(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def _val(value):
    return "NULL" if value is None else str(value)


class _Seq:
    def __init__(self, start):
        self.n = start

    def __call__(self):
        self.n += 1
        return self.n


def _block(table, columns, rows, now):
    if not rows:
        return ""
    cols = ",".join(columns)
    lines = [
        f"SET IDENTITY_INSERT {table} ON;", "GO",
        f"INSERT INTO {table} ({cols},created_at,updated_at) VALUES",
    ]
    rendered = [f" ({r},{_sql_str(now)},{_sql_str(now)})" for r in rows]
    lines.append(",\n".join(rendered) + ";")
    lines += ["GO", f"SET IDENTITY_INSERT {table} OFF;", "GO", ""]
    return "\n".join(lines) + "\n"


def build(existing, wc_json, year, now):
    year = str(year)
    if year in existing.season_keys:
        raise ValueError(f"season {year} already present; nothing to append")

    ids = {t: _Seq(existing.maxid[t]) for t in TABLES}
    matches = sorted(
        wc_json["matches"],
        key=lambda m: (m["date"], m.get("time", ""), wc_json["matches"].index(m)),
    )

    new_countries, new_teams = [], []
    team_id = {}  # openfootball team name -> teams.id

    def resolve_team(name):
        if name in team_id:
            return team_id[name]
        cid = existing.country_id(name)
        if cid is not None:
            tid = existing.team_id_for_country(cid)
            if tid is None:
                tid = ids["teams"]()
                slug_row = None  # country already exists; team row only
                new_teams.append((tid, name, cid))
        elif name in NEW_COUNTRIES:
            slug, key2, code = NEW_COUNTRIES[name]
            cid = ids["countries"]()
            new_countries.append((cid, name, slug, key2, code))
            tid = ids["teams"]()
            new_teams.append((tid, name, cid, code))
        else:
            raise ValueError(
                f"unknown team {name!r}: add it to NEW_COUNTRIES with slug/key/code"
            )
        team_id[name] = tid
        return tid

    # countries and teams need the code; keep code alongside for the team row.
    code_of = {}
    for name, (_s, _k, code) in NEW_COUNTRIES.items():
        code_of[name] = code
    for t in matches:
        resolve_team(t["team1"])
        resolve_team(t["team2"])

    season_id = ids["seasons"]()
    event_id = ids["events"]()

    round_id, round_rows = {}, []
    group_id, group_rows = {}, []
    for name in sorted({m["group"] for m in matches if m.get("group")}):
        gid = ids["groups"]()
        group_id[name] = gid
        group_rows.append(f"{gid},{event_id},{_sql_str(name)},{len(group_rows) + 1},NULL")
    for m in matches:
        if m["round"] not in round_id:
            rid = ids["rounds"]()
            round_id[m["round"]] = rid
            round_rows.append(f"{rid},{event_id},{_sql_str(m['round'])},{len(round_rows) + 1}")

    person_id, person_rows = {}, []
    used_keys = set(existing.person_keys)

    def resolve_person(name, team_id):
        if name in person_id:
            return person_id[name]
        reused = existing.existing_person(name, team_id)
        if reused is not None:
            person_id[name] = reused
            return reused
        base = slugify(name) or "unknown"
        key, i = base, 1
        while key in used_keys:
            i += 1
            key = f"{base}{i}"
        used_keys.add(key)
        pid = ids["persons"]()
        person_rows.append(f"{pid},{_sql_str(key)},{_sql_str(name)}")
        person_id[name] = pid
        return pid

    event_team_rows = [
        f"{ids['events_teams']()},{event_id},{tid}"
        for tid in sorted(team_id.values())
    ]

    groups_teams_rows = []
    for gname in sorted(group_id):
        members = set()
        for m in matches:
            if m.get("group") == gname:
                members.add(team_id[m["team1"]])
                members.add(team_id[m["team2"]])
        for tid in sorted(members):
            groups_teams_rows.append(f"{ids['groups_teams']()},{group_id[gname]},{tid}")

    match_rows, goal_rows = [], []
    for pos, m in enumerate(matches, 1):
        mid = ids["matches"]()
        t1, t2 = team_id[m["team1"]], team_id[m["team2"]]
        s = m["score"]
        ft, et, pk = s["ft"], s.get("et"), s.get("p")
        winner, winner90 = match_outcome(s)
        gid = group_id.get(m.get("group")) if m.get("group") else None
        match_rows.append(
            ",".join(_val(v) for v in [
                mid, None, event_id, pos, pos, t1, t2, round_id[m["round"]], gid,
                _sql_str(m["date"]), _sql_str(strip_time(m.get("time", ""))),
                ft[0], ft[1],
                et[0] if et else None, et[1] if et else None,
                pk[0] if pk else None, pk[1] if pk else None,
                None, None, None, None, None, None, winner, winner90, None,
            ])
        )
        for side, team in (("goals1", t1), ("goals2", t2)):
            for g in m.get(side) or []:
                minute, offset = parse_minute(str(g["minute"]))
                pen = 1 if g.get("penalty") else 0
                og = 1 if g.get("owngoal") else 0
                pid = resolve_person(g["name"], team)
                goal_rows.append(
                    f"{ids['goals']()},{pid},{mid},{team},{minute},{offset},NULL,NULL,{pen},{og}"
                )

    country_vals = [
        f"{cid},{_sql_str(n)},{_sql_str(slug)},{_sql_str(k)},{_sql_str(code)}"
        for cid, n, slug, k, code in new_countries
    ]
    team_vals = []
    for row in new_teams:
        tid, name, cid = row[0], row[1], row[2]
        code = row[3] if len(row) > 3 else code_of.get(name, existing_code(existing, cid))
        team_vals.append(f"{tid},{_sql_str(code.lower())},{_sql_str(name)},{_sql_str(code)},{cid}")

    out = [f"\n-- ===== World Cup {year} (appended by tools/worldcup-import) =====\n"]
    out.append(_block("countries", ["id", "[name]", "slug", "[key]", "code"], country_vals, now))
    out.append(_block("teams", ["id", "[key]", "[name]", "code", "country_id"], team_vals, now))
    out.append(_block("seasons", ["id", "[key]", "[name]"],
                      [f"{season_id},{_sql_str(year)},{_sql_str(year)}"], now))
    out.append(_block("events", ["id", "[key]", "season_id", "[start_date]"],
                      [f"{event_id},{_sql_str('worldcup.' + year)},{season_id},{_sql_str(year + '-01-01')}"], now))
    out.append(_block("events_teams", ["id", "event_id", "team_id"], event_team_rows, now))
    out.append(_block("groups", ["id", "event_id", "[name]", "pos", "[key]"], group_rows, now))
    out.append(_block("groups_teams", ["id", "group_id", "team_id"], groups_teams_rows, now))
    out.append(_block("rounds", ["id", "event_id", "[name]", "pos"], round_rows, now))
    out.append(_block("persons", ["id", "[key]", "[name]"], person_rows, now))
    out.append(_block(
        "matches",
        ["id", "[key]", "event_id", "pos", "num", "team1_id", "team2_id", "round_id",
         "group_id", "[date]", "[time]", "score1", "score2", "score1et", "score2et",
         "score1p", "score2p", "score1i", "score2i", "score1ii", "score2ii",
         "next_match_id", "prev_match_id", "winner", "winner90", "comments"],
        match_rows, now))
    out.append(_block(
        "goals",
        ["id", "person_id", "match_id", "team_id", "[minute]", "offset",
         "score1", "score2", "penalty", "owngoal"],
        goal_rows, now))
    return "".join(out)


def existing_code(existing, country_id):
    raise ValueError(f"country {country_id} has no team and no code to build one")


def fetch(year):
    with urllib.request.urlopen(SOURCE_URL.format(year=year)) as resp:
        return json.load(resp)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Append a World Cup to worldcup.sql")
    ap.add_argument("year", type=int)
    ap.add_argument("--sql", default="sql-server/worldcup.sql",
                    help="path to worldcup.sql to read maxima from and append to")
    ap.add_argument("--json", help="local worldcup.json instead of fetching openfootball")
    ap.add_argument("--now", default="2024-10-02 00:00:00")
    ap.add_argument("--stdout", action="store_true", help="print block instead of appending")
    args = ap.parse_args(argv)

    sql_text = open(args.sql, encoding="utf-8").read()
    wc = json.load(open(args.json, encoding="utf-8")) if args.json else fetch(args.year)
    block = build(parse_existing(sql_text), wc, args.year, args.now)

    if args.stdout:
        sys.stdout.write(block)
    else:
        with open(args.sql, "a", encoding="utf-8") as fh:
            fh.write(block)
        sys.stderr.write(f"appended World Cup {args.year} to {args.sql}\n")


if __name__ == "__main__":
    main()
