import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { RequestHandler, type Router, Request, Response } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import * as worldcupSchemas from "./worldcupModel";

import sql from 'mssql';

const sqlConfig = {
  user: 'sa',
  password: 'password123!',
  database: 'sportdb',
  server: 'localhost',
  port: 5174,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustServerCertificate: true
  }
}

export const worldcupRegistry = new OpenAPIRegistry();
export const worldcupRouter: Router = express.Router();

worldcupRegistry.register("WorldcupSample", worldcupSchemas.WorldcupSampleSchema);
worldcupRegistry.register("Worldcup-Countries", worldcupSchemas.CountrySchema);
worldcupRegistry.register("Worldcup-Events", worldcupSchemas.EventSchema);
worldcupRegistry.register("Worldcup-EventsTeams", worldcupSchemas.EventTeamSchema);
worldcupRegistry.register("Worldcup-Goals", worldcupSchemas.GoalSchema);
worldcupRegistry.register("Worldcup-Groups", worldcupSchemas.GroupSchema);
worldcupRegistry.register("Worldcup-GroupsTeams", worldcupSchemas.GroupTeamSchema);
worldcupRegistry.register("Worldcup-Matches", worldcupSchemas.MatchSchema);
worldcupRegistry.register("Worldcup-Persons", worldcupSchemas.PersonSchema);
worldcupRegistry.register("Worldcup-Seasons", worldcupSchemas.SeasonSchema);
worldcupRegistry.register("Worldcup-Teams", worldcupSchemas.TeamSchema);
worldcupRegistry.register("Worldcup-Rounds", worldcupSchemas.RoundSchema);

worldcupRegistry.registerPath({
  method: "get",
  path: "/Worldcup/sampleData",
  tags: ["Worldcup"],
  responses: createApiResponse(z.array(worldcupSchemas.WorldcupSampleSchema), "Success"),
});


const getSample: RequestHandler = async (_req: Request, res: Response) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`
      SELECT TOP 3 e.[key], r.name AS Round, t1.name AS Team1, c1.code AS Team1Code, m.score1, t2.name AS Team2, c2.code AS Team2Code, m.score2
      FROM matches m
      JOIN teams t1 ON t1.id=m.team1_id
      JOIN countries c1 ON t1.country_id=c1.id
      JOIN teams t2 ON t2.id=m.team2_id
      JOIN countries c2 ON t2.country_id=c2.id
      JOIN rounds r ON m.round_id=r.id
      JOIN events e ON r.event_id=e.id
      ORDER BY e.start_date DESC
    `
    console.dir(result.recordsets)
    const serviceResponse = ServiceResponse.success<any[]>("Footy sample found", result.recordset);
    return handleServiceResponse(serviceResponse, res);
  } catch (err) {
    console.error(err)
  }
};

worldcupRouter.get("/sampleData", getSample);
