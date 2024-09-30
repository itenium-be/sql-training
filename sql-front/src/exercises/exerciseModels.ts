export type ExerciseModel = {
  id: ExerciseId;
  name: string;
  sampleQuery: string;
  desc: string;
  exercises: SqlExerciseModel[];
}

export type SqlExerciseModel = {
  id: number;
  desc: string;
  points: number;
  expected: any[][];
  /** Require specific array order */
  expectedOrder: boolean;
  expectedColumns: string[];
  hints?: string;
}

export type Score = {
  player: string;
  game: string;
  exerciseid: number;
  solutionlength: number;
  /** in seconds */
  elapsed: number;
}

export type ExerciseId = 'World' | 'Teachers';

const worldExercises: ExerciseModel = {
  id: 'World',
  name: 'Countries of the world',
  sampleQuery: 'SELECT id, name, continent, area, population, gdp, capital, tld FROM countries',
  desc: 'The starter exercises! (postgres database)',
  exercises: [
    {
      id: 1,
      desc: 'Give the name and the per capita GDP (without decimals) for all countries with a population of at least 200 million.',
      points: 1,
      expected: [
        ['Brazil', 11115],
        ['China', 6121],
        ['India', 1504],
        ['Indonesia', 3482],
        ['United States', 51032],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'gdp per capita'],
    },
    {
      id: 2,
      desc: 'Find the country that has all the vowels and no spaces in its name.',
      points: 1,
      expected: [['Mozambique']],
      expectedOrder: false,
      expectedColumns: ['name'],
    },
    {
      id: 3,
      desc: 'For South America show population in millions and GDP in billions both to 2 decimal places. Sort them by largest GDP.',
      points: 2,
      expected: [
        ['Brazil', 202.79, 2254.11],
        ['Argentina', 42.67, 477.03],
        ['Venezuela', 28.95, 382.42],
        ['Colombia', 47.66, 369.81],
        ['Chile', 17.77, 268.31],
        ['Peru', 30.48, 204.68],
        ['Ecuador', 15.77, 87.50],
        ["Uruguay", 3.29, 49.92],
        ['Bolivia', 10.03, 27.04],
        ['Paraguay', 6.78, 25.94],
        ['Suriname', 0.53, 5.01],
        ['Guyana', 0.78, 2.85],
        ['Saint Vincent and the Grenadines', 0.11, 0.69],
      ],
      expectedOrder: true,
      expectedColumns: ['name', 'population (M)', 'gdp (B)'],
      hints: 'Using COUNT(a), COUNT(b) will have "b" overwrite the values of "a". Use aliases!'
    },
    {
      id: 4,
      desc: 'Which countries have a GDP greater than every country in Europe?',
      points: 2,
      expected: [
        ['China'],
        ['Japan'],
        ['United States'],
      ],
      expectedOrder: false,
      expectedColumns: ['name']
    },
    {
      id: 5,
      desc: 'Find the largest country (by area) in each continent, show the continent, the name and the area. Sort by continent.',
      points: 2,
      expected: [
        ['Africa', 'Algeria', 2381741],
        ['Asia', 'China', 9596961],
        ['Caribbean', 'Cuba', 109884],
        ['Eurasia', 'Russia', 17125242],
        ['Europe', 'Kazakhstan', 2724900],
        ['North America', 'Canada', 9984670],
        ['Oceania', 'Australia', 7692024],
        ['South America', 'Brazil', 8515767],
      ],
      expectedOrder: true,
      expectedColumns: ['continent', 'country', 'area'],
    },
    {
      id: 6,
      desc: 'List the continents with the amount of countries in it, the country with the smallest area and its name, the total population and the rounded average gdp per capita.',
      points: 3,
      expected: [
        ['Africa', 53, 452, 'Seychelles', 1016091005, 2687],
        ['Asia', 46, 300, 'Maldives', 4317455576, 12988],
        ['Caribbean', 11, 344, 'Grenada', 36149204, 10049],
        ['Eurasia', 2, 29743, 'Armenia', 149017400, 8600],
        ['Europe', 44, 0, 'Vatican City', 610261850, 34405],
        ['North America', 11, 261, 'Saint Kitts and Nevis', 518755156, 14104],
        ['Oceania', 14, 21, 'Nauru', 37783477, 11284],
        ['South America', 13, 389, 'Saint Vincent and the Grenadines', 407618970, 8594],
      ],
      expectedOrder: true,
      expectedColumns: ['continent', 'countries', 'smallest area', 'smallest name', 'total population', 'averga gdp']
    },
    {
      id: 7,
      desc: 'Show the name and the population of each country in Europe. Also show the population as the rounded percentage of the population of Germany. Only take the countries where the population is at least 50% and sort by largest %.',
      points: 3,
      expected: [
        ['Germany', 80716000, '100%'],
        ['France', 65906000, '82%'],
        ['United Kingdom', 64105700, '79%'],
        ['Italy', 60782668, '75%'],
        ['Spain', 46609700, '58%'],
        ['Ukraine', 43009258, '53%'],
      ],
      expectedOrder: true,
      expectedColumns: ['name', 'population', 'population % of Germany']
    },
    {
      id: 8,
      desc: 'Get confusing top level domains: tld that are the start or end of a different country name, sorted by tld. Select the tld and a "," separated list of matching country names, sort the country names descending by population.',
      points: 5,
      expected: [
        ['.al', 'Nepal,Senegal,Portugal'],
        ['.ar', 'Myanmar,Madagascar,Qatar'],
        ['.au', 'Guinea-Bissau,Palau'],
        ['.ca', 'South Africa,Costa Rica,Jamaica,Dominica'],
        ['.co', 'Mexico,Morocco,Monaco'],
        ['.es', 'United States,Philippines,United Arab Emirates,Maldives,Saint Vincent and the Grenadines,Seychelles'],
        ['.in', 'Spain,Benin,Bahrain,Liechtenstein'],
        ['.la', 'Venezuela,Angola,Guatemala'],
        ['.na', 'China,Argentina,Ghana,Bosnia and Herzegovina,Botswana,Guyana'],
        ['.ne', 'Ukraine,Sierra Leone'],
        ['.ru', 'Peru,Nauru'],
        ['.us', 'Belarus,Mauritius,Cyprus'],
      ],
      expectedOrder: true,
      expectedColumns: ['tld', 'country1,country2'],
    }
  ],
}

const teacherExercises: ExerciseModel = {
  id: 'Teachers',
  name: 'Teachers & Departments',
  sampleQuery: 'SELECT t.name, t.phone, t.mobile, employed_at, birth_date, d.name as dept_name, d.phone as dept_phone FROM teachers t JOIN departments d ON t.dept=d.id',
  desc: 'Be social, join tables! (postgres)',
  exercises: [
    {
      id: 1,
      desc: 'Display the deparments and the number of staff',
      points: 1,
      expected: [
        ["Design", 1],
        ["Computing", 3],
        ["Engineering", 0],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'count']
    },
    {
      id: 2,
      desc: 'List all teachers with their department. Display "None" if they do not belong to a department.',
      points: 2,
      expected: [
        ["Splint", "Computing"],
        ["Throd", "Computing"],
        ["Shrivell", "Computing"],
        ["Cutflower", "Design"],
        ["Deadyawn", "None"],
        ["Spiregrain", "None"],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'dept_name']
    },
    {
      id: 3,
      desc: 'Show the name of the teacher and, depending on the department, show "Sci", "Art" or "None".',
      points: 2,
      expected: [
        ['Splint', 'Sci'],
        ['Throd', 'Sci'],
        ['Shrivell', 'Sci'],
        ['Cutflower', 'Art'],
        ['Deadyawn', 'None'],
        ['Spiregrain', 'None'],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'department type']
    },
    {
      id: 4,
      desc: "Show all teachers and their mobile number. If they don't have one, fallback to their extension and if they don't have an office, fallback to the department extension. We need to be able to call them right away, so phone numbers must start with +32 and be without any spaces. The school number is 09 331 0000",
      points: 4,
      expected: [
        ['Shrivell', '+32476403509'],
        ['Throd', '+32477996655'],
        ['Splint', '+3293312793'],
        ['Spiregrain', '+32799555657'],
        ['Cutflower', '+3293313200'],
        ['Deadyawn', '+3293313345'],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'phone']
    },
    {
      id: 5,
      desc: 'Select all teacher with a name starting with "S" and their seniority (in years)',
      points: 2,
      expected: [
        ['Shrivell', 23],
        ['Splint', 2],
        ['Spiregrain', 25],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'seniority']
    },
    {
      id: 6,
      desc: 'Show the teacher names with a birthday today (3/10)',
      points: 1,
      expected: [
        ['Throd']
      ],
      expectedOrder: false,
      expectedColumns: ['name']
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


export const exercises = [
  worldExercises,
  teacherExercises,
]
