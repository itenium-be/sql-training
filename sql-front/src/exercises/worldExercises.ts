import { ExerciseModel } from "./exerciseModels";

export const worldExercises: ExerciseModel = {
  id: 'World',
  name: 'Countries of the world',
  sampleQuery: 'SELECT id, name, continent, area, population, gdp, capital, tld FROM countries',
  desc: 'The starter exercises! (postgres database)',
  exercises: [
    {
      id: 1,
      desc: 'Give the name and the floored per capita GDP for all countries with a population of at least 200 million.',
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
        ['Africa', 53, 452, 'Seychelles', 1016091005, 1783],
        ['Asia', 46, 300, 'Maldives', 4317455576, 5571],
        ['Caribbean', 11, 344, 'Grenada', 36149204, 5297],
        ['Eurasia', 2, 29743, 'Armenia', 149017400, 13688],
        ['Europe', 44, 0, 'Vatican City', 610261850, 30060],
        ['North America', 11, 261, 'Saint Kitts and Nevis', 518755156, 37012],
        ['Oceania', 14, 21, 'Nauru', 37783477, 46564],
        ['South America', 13, 389, 'Saint Vincent and the Grenadines', 407618970, 10194],
      ],
      expectedOrder: false,
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
      points: 4,
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
