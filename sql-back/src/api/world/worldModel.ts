import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type World = z.infer<typeof WorldSchema>;
export const WorldSchema = z.object({
  id: z.number(),
  name: z.string(),
  continent: z.string(),
  area: z.number(),
  population: z.number(),
  gdp: z.number(),
  capital: z.string(),
  tld: z.string(),
});
