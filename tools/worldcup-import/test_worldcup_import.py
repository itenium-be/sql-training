import unittest

import worldcup_import as w


class ParseMinute(unittest.TestCase):
    def test_plain(self):
        self.assertEqual(w.parse_minute("67"), (67, 0))

    def test_stoppage(self):
        self.assertEqual(w.parse_minute("120+5"), (120, 5))
        self.assertEqual(w.parse_minute("45+2"), (45, 2))


class Slugify(unittest.TestCase):
    def test_accents_and_punct(self):
        self.assertEqual(w.slugify("Julián Quiñones"), "julianquinones")
        self.assertEqual(w.slugify("L. Laurent"), "llaurent")
        self.assertEqual(w.slugify("N'Golo Kanté"), "ngolokante")


class Outcome(unittest.TestCase):
    def test_regulation(self):
        self.assertEqual(w.match_outcome({"ft": [2, 0], "ht": [1, 0]}), (1, 1))

    def test_group_draw(self):
        self.assertEqual(w.match_outcome({"ft": [1, 1]}), (0, 0))

    def test_extra_time(self):
        self.assertEqual(w.match_outcome({"ft": [0, 0], "et": [1, 0]}), (1, 0))

    def test_penalties(self):
        # 90' draw 1-1, aet 1-1, pens 3-4 -> team2 wins, 90' is a draw
        self.assertEqual(
            w.match_outcome({"ft": [1, 1], "et": [1, 1], "p": [3, 4]}), (2, 0)
        )


class StripTime(unittest.TestCase):
    def test_drops_tz(self):
        self.assertEqual(w.strip_time("13:00 UTC-6"), "13:00")
        self.assertEqual(w.strip_time("15:00 UTC-4"), "15:00")


# Minimal existing dump: 2 countries/teams, 1 person, seasons up to 2022.
EXISTING = """
SET IDENTITY_INSERT countries ON;
GO
INSERT INTO countries (id,[name],slug,[key],code,created_at,updated_at)
VALUES
 (1,'Mexico','mexico','mx','MEX','2024-10-02 13:29:19','2024-10-02 13:29:19'),
 (2,'United States','united-states','us','USA','2024-10-02 13:29:20','2024-10-02 13:29:20');
SET IDENTITY_INSERT countries OFF;
GO
INSERT INTO teams (id,[key],[name],code,country_id,created_at,updated_at)
VALUES
 (1,'mex','Mexico','MEX',1,'2024-10-02 13:29:19','2024-10-02 13:29:19'),
 (2,'usa','United States','USA',2,'2024-10-02 13:29:20','2024-10-02 13:29:20');
INSERT INTO seasons (id,[key],[name],created_at,updated_at) VALUES
 (21,'2018','2018','2024-10-02','2024-10-02'),
 (22,'2022','2022','2024-10-02','2024-10-02');
INSERT INTO persons (id,[key],[name],created_at,updated_at) VALUES
 (1,'llaurent','L. Laurent','2024-10-02','2024-10-02');
INSERT INTO events (id,[key],season_id,[start_date],created_at,updated_at)
VALUES
 (22,'worldcup.2022',22,'2022-01-01','2024-10-02','2024-10-02');
INSERT INTO events_teams (id,event_id,team_id,created_at,updated_at)
VALUES (491,22,1,'2024-10-02','2024-10-02');
INSERT INTO groups (id,event_id,[name],pos,[key],created_at,updated_at) VALUES
 (125,22,'Group H',8,NULL,'2024-10-02','2024-10-02');
INSERT INTO groups_teams (id,group_id,team_id,created_at,updated_at) VALUES
 (492,125,1,'2024-10-02','2024-10-02');
INSERT INTO rounds (id,event_id,[name],pos,created_at,updated_at) VALUES
 (229,22,'Final',18,'2024-10-02','2024-10-02');
INSERT INTO matches (id,[key],event_id,pos,num,team1_id,team2_id,round_id,group_id,[date],[time],score1,score2,score1et,score2et,score1p,score2p,score1i,score2i,score1ii,score2ii,next_match_id,prev_match_id,winner,winner90,comments,created_at,updated_at) VALUES
 (964,NULL,22,64,64,1,2,229,NULL,'2022-12-18','18:00',2,2,3,3,4,2,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2024-10-02','2024-10-02');
INSERT INTO goals (id,person_id,match_id,team_id,[minute],offset,score1,score2,penalty,owngoal,created_at,updated_at) VALUES
 (824,1,964,1,118,0,NULL,NULL,1,0,'2024-10-02','2024-10-02');
"""


class ParseExisting(unittest.TestCase):
    def setUp(self):
        self.e = w.parse_existing(EXISTING)

    def test_maxids(self):
        self.assertEqual(self.e.maxid["countries"], 2)
        self.assertEqual(self.e.maxid["matches"], 964)
        self.assertEqual(self.e.maxid["goals"], 824)
        self.assertEqual(self.e.maxid["seasons"], 22)
        self.assertEqual(self.e.maxid["persons"], 1)

    def test_country_lookup_by_name(self):
        self.assertEqual(self.e.country_id("Mexico"), 1)
        self.assertEqual(self.e.country_id("United States"), 2)

    def test_team_id_by_country(self):
        self.assertEqual(self.e.team_id_for_country(1), 1)

    def test_seasons_present(self):
        self.assertIn("2022", self.e.season_keys)


# Tiny but structurally complete 2026-shaped tournament: 1 group match + 1 final,
# featuring a debutant (Uzbekistan) so new country/team creation is exercised.
WC_JSON = {
    "name": "World Cup 2026",
    "matches": [
        {
            "round": "Matchday 1",
            "date": "2026-06-11",
            "time": "13:00 UTC-6",
            "team1": "Mexico",
            "team2": "USA",
            "group": "Group A",
            "score": {"ft": [2, 1], "ht": [1, 0]},
            "goals1": [
                {"name": "Julián Quiñones", "minute": "9"},
                {"name": "Raúl Jiménez", "minute": "67", "penalty": True},
            ],
            "goals2": [{"name": "Own Goal", "minute": "80", "owngoal": True}],
        },
        {
            "round": "Final",
            "num": 104,
            "date": "2026-07-19",
            "time": "15:00 UTC-4",
            "team1": "Mexico",
            "team2": "Uzbekistan",
            "score": {"ft": [1, 1], "et": [1, 1], "p": [4, 3], "ht": [0, 0]},
            "goals1": [{"name": "Raúl Jiménez", "minute": "30"}],
            "goals2": [{"name": "Eldor Shomurodov", "minute": "88"}],
        },
    ],
}


class Build(unittest.TestCase):
    def setUp(self):
        self.e = w.parse_existing(EXISTING)
        self.sql = w.build(self.e, WC_JSON, 2026, "2026-11-10 00:00:00")

    def test_refuses_duplicate_year(self):
        dup = w.parse_existing(EXISTING)
        dup.season_keys.add("2026")
        with self.assertRaises(ValueError):
            w.build(dup, WC_JSON, 2026, "2026-11-10 00:00:00")

    def test_new_country_and_team_created(self):
        self.assertIn("'Uzbekistan','uzbekistan','uz','UZB'", self.sql)
        self.assertIn("SET IDENTITY_INSERT countries ON", self.sql)
        # new country id = max+1 = 3, team id = max+1 = 3
        self.assertIn("(3,'Uzbekistan','uzbekistan','uz','UZB'", self.sql)

    def test_existing_country_not_duplicated(self):
        self.assertNotIn("'Mexico','mexico'", self.sql)

    def test_season_and_event(self):
        self.assertIn("(23,'2026','2026'", self.sql)
        self.assertIn("(23,'worldcup.2026',23,'2026-01-01'", self.sql)

    def test_match_rows(self):
        # 2 matches -> ids 965, 966; group match has group_id, final has NULL group
        self.assertIn(",965,", self.sql)
        self.assertIn(",966,", self.sql)

    def test_penalty_goal_flagged(self):
        # Raúl Jiménez penalty at 67'
        self.assertRegex(self.sql, r"\(\d+,\d+,\d+,\d+,67,0,NULL,NULL,1,0")

    def test_owngoal_flagged(self):
        self.assertRegex(self.sql, r",80,0,NULL,NULL,0,1,")

    def test_final_scores_and_outcome(self):
        # final: ft 1-1, et 1-1, p 4-3 -> winner 1 (Mexico), winner90 0
        self.assertIn("1,1,1,1,4,3", self.sql)

    def test_persons_created_for_scorers(self):
        self.assertIn("'eldorshomurodov','Eldor Shomurodov'", self.sql)

    def test_header_comment_does_not_swallow_sql(self):
        # a '--' comment runs to end of line; the SET must start on its own line
        self.assertNotRegex(self.sql, r"=====[ \t]*SET IDENTITY_INSERT")
        for line in self.sql.splitlines():
            stripped = line.strip()
            if stripped.startswith("--"):
                self.assertNotIn("SET IDENTITY_INSERT", stripped)
                self.assertNotIn("INSERT INTO", stripped)

    def test_well_formed_blocks(self):
        self.assertEqual(self.sql.count("SET IDENTITY_INSERT matches ON"), 1)
        self.assertEqual(self.sql.count("SET IDENTITY_INSERT matches OFF"), 1)


if __name__ == "__main__":
    unittest.main()
