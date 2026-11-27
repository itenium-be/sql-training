import { ExerciseId } from '../exercises/exerciseModels';

type Level = 'easy' | 'medium' | 'hard' | 'expert';

type Dataset = {
  title: string;
  blurb: string;
  level: Level;
  db: 'Postgres' | 'SQL Server';
  image: string;
};

export const datasets: Record<ExerciseId, Dataset> = {
  World: { title: 'Countries', blurb: 'The basics — one table.', level: 'easy', db: 'Postgres', image: '/img/game-countries.png' },
  Teachers: { title: 'Teachers', blurb: 'Start joining tables.', level: 'medium', db: 'Postgres', image: '/img/game-teachers.png' },
  Worldcup: { title: 'Worldcup', blurb: 'Many related tables.', level: 'hard', db: 'SQL Server', image: '/img/game-worldcup.png' },
  Company: { title: 'Company', blurb: 'Query at scale — many rows.', level: 'expert', db: 'Postgres', image: '/img/game-company.png' },
};
