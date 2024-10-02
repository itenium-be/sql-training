import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const WorldcupSampleSchema = z.object({
  name: z.string(),
  phone: z.string(),
  mobile: z.string(),
  salary: z.number(),
  employed_at: z.date(),
  birth_date: z.date(),
  dept_name: z.string(),
  dept_phone: z.string(),
});
