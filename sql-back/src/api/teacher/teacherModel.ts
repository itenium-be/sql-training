import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const TeacherSampleSchema = z.object({
  name: z.string(),
  phone: z.string(),
  mobile: z.string(),
  dept_name: z.string(),
  dept_phone: z.string(),
});

export const TeacherSchema = z.object({
  id: z.number(),
  dept: z.string(),
  name: z.string(),
  phone: z.string(),
  mobile: z.string(),
});

export const DepartmentSchema = z.object({
  id: z.number(),
  dept: z.string(),
  phone: z.string(),
});
