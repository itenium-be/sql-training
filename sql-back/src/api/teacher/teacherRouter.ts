import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { RequestHandler, type Router, Request, Response } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery } from "../query";
import { DepartmentSchema, TeacherSampleSchema, TeacherSchema } from "./teacherModel";

export const teacherRegistry = new OpenAPIRegistry();
export const teacherRouter: Router = express.Router();

teacherRegistry.register("Teacher", TeacherSchema);
teacherRegistry.register("Department", DepartmentSchema);
teacherRegistry.register("TeacherSample", TeacherSampleSchema);

teacherRegistry.registerPath({
  method: "get",
  path: "/Teachers/sampleData",
  tags: ["Teachers"],
  responses: createApiResponse(z.array(TeacherSampleSchema), "Success"),
});

teacherRegistry.registerPath({
  method: "get",
  path: "/Teachers",
  tags: ["Teachers"],
  responses: createApiResponse(z.array(TeacherSchema), "Success"),
});

teacherRegistry.registerPath({
  method: "get",
  path: "/Teachers/Departments",
  tags: ["Teachers"],
  responses: createApiResponse(z.array(DepartmentSchema), "Success"),
});

const getSample: RequestHandler = async (_req: Request, res: Response) => {
  const result = await executeQuery(
    `SELECT t.name, t.phone, t.mobile, salary,
    TO_CHAR(employed_at, 'YYYY-MM-DD') AS employed_at, TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date,
    d.name as dept_name, d.phone as dept_phone
    FROM teachers t JOIN departments d ON t.dept=d.id`
  );
  const serviceResponse = ServiceResponse.success<any[]>("Sample data found", result.rows);
  return handleServiceResponse(serviceResponse, res);
};

const getTeachers: RequestHandler = async (_req: Request, res: Response) => {
  const result = await executeQuery(
    `SELECT id, dept, name, phone, mobile, salary,
    TO_CHAR(employed_at, 'YYYY-MM-DD') AS employed_at, TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date
    FROM teachers`
  );
  const serviceResponse = ServiceResponse.success<any[]>("Teachers found", result.rows);
  return handleServiceResponse(serviceResponse, res);
};

const getDepartments: RequestHandler = async (_req: Request, res: Response) => {
  const result = await executeQuery('SELECT * FROM departments');
  const serviceResponse = ServiceResponse.success<any[]>("Departments found", result.rows);
  return handleServiceResponse(serviceResponse, res);
};

teacherRouter.get("/sampleData", getSample);
teacherRouter.get("/", getTeachers);
teacherRouter.get("/Departments", getDepartments);
