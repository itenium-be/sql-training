import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const WorldcupSampleSchema = z.object({
  key: z.string(),
  Round: z.string(),
  Team1: z.string(),
  Team1Code: z.string(),
  score1: z.number(),
  Team2: z.string(),
  Team2Code: z.string(),
  score2: z.number(),
});


export const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  key: z.string(),
  code: z.string(),
});

export const EventSchema = z.object({
  id: z.number(),
  key: z.string(),
  season_id: z.number(),
  start_date: z.date(),
});

export const EventTeamSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  team_id: z.number(),
});

export const GoalSchema = z.object({
  id: z.number(),
  person_id: z.number(),
  match_id: z.number(),
  team_id: z.number(),
  minute: z.number(),
  offset: z.number(),
  score1: z.number(),
  score2: z.number(),
  penalty: z.boolean(),
  owngoal: z.boolean(),
});

export const GroupSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  name: z.string(),
  pos: z.number(),
  key: z.string(),
});

export const GroupTeamSchema = z.object({
  id: z.number(),
  group_id: z.number(),
  team_id: z.number(),
});

export const MatchSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  pos: z.number(),
  num: z.number(),
  team1_id: z.number(),
  team2_id: z.number(),
  round_id: z.number(),
  group_id: z.number(),
  date: z.date(),
  time: z.string(),
  score1: z.number(),
  score2: z.number(),
  score1et: z.number(),
  score2et: z.number(),
  score1p: z.number(),
  score2p: z.number(),
  score1i: z.number(),
  score2i: z.number(),
  score1ii: z.number(),
  score2ii: z.number(),
  winner: z.number(),
  winner90: z.number(),
});

export const PersonSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
});

export const SeasonSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
});

export const TeamSchema = z.object({
  id: z.number(),
  key: z.string(),
  code: z.string(),
  country_id: z.number(),
});

export const RoundSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  name: z.string(),
  pos: z.number(),
});
