import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Exercise = z.infer<typeof ExerciseSchema>;
export const ExerciseSchema = z.object({
  id: z.number(),
  name: z.string(),

});
