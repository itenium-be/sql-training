import { ExerciseId } from "./exerciseModels";

/** Table name -> column names, used to feed the editor autocomplete. */
export type DatabaseSchema = Record<string, string[]>;

/** Which SQL dialect the formatter and the highlighter should use per game. */
export const dialects: Record<ExerciseId, 'postgresql' | 'transactsql'> = {
  World: 'postgresql',
  Teachers: 'postgresql',
  Worldcup: 'transactsql',
}

const audit = ['created_at', 'updated_at'];

export const schemas: Record<ExerciseId, DatabaseSchema> = {
  World: {
    countries: ['id', 'name', 'continent', 'area', 'population', 'gdp', 'capital', 'tld'],
  },
  Teachers: {
    teachers: ['id', 'dept', 'name', 'phone', 'mobile', 'employed_at', 'birth_date', 'salary'],
    departments: ['id', 'name', 'phone'],
  },
  Worldcup: {
    countries: ['id', 'name', 'slug', 'key', 'code', ...audit],
    events: ['id', 'key', 'season_id', 'start_date', ...audit],
    events_teams: ['id', 'event_id', 'team_id', ...audit],
    goals: ['id', 'person_id', 'match_id', 'team_id', 'minute', 'offset', 'score1', 'score2', 'penalty', 'owngoal', ...audit],
    groups: ['id', 'event_id', 'name', 'pos', 'key', ...audit],
    groups_teams: ['id', 'group_id', 'team_id', ...audit],
    matches: [
      'id', 'key', 'event_id', 'pos', 'num', 'team1_id', 'team2_id', 'round_id', 'group_id',
      'date', 'time', 'score1', 'score2', 'score1et', 'score2et', 'score1p', 'score2p',
      'score1i', 'score2i', 'score1ii', 'score2ii', 'next_match_id', 'prev_match_id',
      'winner', 'winner90', 'comments', ...audit,
    ],
    persons: ['id', 'key', 'name', ...audit],
    rounds: ['id', 'event_id', 'name', 'pos', ...audit],
    seasons: ['id', 'key', 'name', ...audit],
    teams: ['id', 'key', 'name', 'code', 'country_id', ...audit],
  },
}
