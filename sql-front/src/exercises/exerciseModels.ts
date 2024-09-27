export type ExerciseModel = {
  id: string;
  name: string;
  sampleQuery: string;
  desc: string;
  exercises: SqlExerciseModel[];
}

export type SqlExerciseModel = {
  desc: string;
  expected: any[][];
}

const worldExercises: ExerciseModel = {
  id: 'World',
  name: 'Countries of the world',
  sampleQuery: 'SELECT id, name, continent, area, population, gdp, capital, tld FROM countries',
  desc: 'The starter exercises!',
  exercises: [
    {
      desc: 'Give the name and the per capita GDP for those countries with a population of at least 200 million.',
      expected: [
        ['Brazil', 111152648],
        ['China', 61217106],
        ['India', 15047931],
        ['Indonesia', 34820205],
        ['United States', 510322945],
      ]
    }
  ],
}

const nobelExercises: ExerciseModel = {
  id: 'Nobel',
  name: 'Nobel Prices',
  sampleQuery: '',
  desc: '',
  exercises: [],
}


export const exercises = [
  worldExercises,
  nobelExercises,
]
