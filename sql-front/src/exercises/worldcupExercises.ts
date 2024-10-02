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
      desc: 'Ex1',
      points: 1,
      expected: [],
      expectedOrder: false,
      expectedColumns: ['', '']
    },
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
