import { ExerciseModel } from "./exerciseModels";

export const worldcupExercises: ExerciseModel = {
  id: 'Worldcup',
  name: "Let's footy",
  sampleQuery: `SELECT TOP 3 e.[key], r.name AS Round, t1.name AS Team1, c1.code AS Team1Code, m.score1, t2.name AS Team2, c2.code AS Team2Code, m.score2
FROM matches m JOIN teams t1 ON t1.id=m.team1_id JOIN countries c1 ON t1.country_id=c1.id
JOIN teams t2 ON t2.id=m.team2_id JOIN countries c2 ON t2.country_id=c2.id
JOIN rounds r ON m.round_id=r.id JOIN events e ON r.event_id=e.id`,
  desc: 'More tables. (sql server)',
  schema: true,
  exercises: [
    {
      id: 1,
      desc: 'Which country was always present?',
      points: 2,
      expected: [['Brazil']],
      expectedOrder: false,
      expectedColumns: ['team.name']
    },
    {
      id: 2,
      desc: 'Which country has "scored" the most ungoals?',
      points: 3,
      expected: [
        ['France', 4]
      ],
      expectedOrder: false,
      expectedColumns: ['team.name', 'owngoal_count']
    },
    {
      id: 3,
      desc: 'Select the year of the worldcup in which the most penalties were scored',
      points: 3,
      expected: [
        [2018, 22]
      ],
      expectedOrder: false,
      expectedColumns: ['year', 'amount']
    },
    {
      id: 4,
      desc: 'Find players that played for different countries and a "," separated list of countries they played for',
      points: 4,
      expected: [
        ['Cheryshev', 'Russia,Uruguay'],
        ['Enzo Fernández', 'Argentina,Australia'],
        ['Fernandinho', 'Belgium,Brazil'],
        ['M. Rosas', 'Chile,Mexico'],
        ['Mandžukic', 'Croatia,France'],
        ['Varela', 'Portugal,Uruguay'],
        ['Vidal', 'Chile,Uruguay'],
      ],
      expectedOrder: false,
      expectedColumns: ['person.name', 'countries']
    },
    {
      id: 5,
      desc: 'Which countries always survived the "Group Stage" (when present), and how many times was this? (A round not called "Matchday")',
      points: 6,
      expected: [
        ['Netherlands', 11],
        ['Dutch East Indies (-1945)', 1],
        ['Cuba', 1],
        ['Turkey', 2],
        ['Ireland', 3],
        ['Ukraine', 1],
        ['Slovakia', 1],
      ],
      expectedOrder: false,
      expectedColumns: ['country.name', 'times_participated']
    },
    // {
    //   id: 5,
    //   desc: '',
    //   points: 1,
    //   expected: [],
    //   expectedOrder: false,
    //   expectedColumns: ['', '']
    // },
  ],
}

// {
//   id: 1,
//   desc: '',
//   points: 1,
//   expected: [],
//   expectedOrder: false,
//   expectedColumns: ['', '']
// },
