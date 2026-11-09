import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type RequestHandler, type Response, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { executeQuery } from "../query";

extendZodWithOpenApi(z);

export const companySampleQuery = `SELECT o.id, o.ordered_at, o.status, c.name AS customer, e.name AS sales_rep,
  l.line_no, p.name AS product, p.attributes, l.quantity, l.unit_price
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN employees e ON e.id = o.employee_id
JOIN order_lines l ON l.order_id = o.id
JOIN products p ON p.id = l.product_id
WHERE o.id <= 2
ORDER BY o.id, l.line_no`;

const CompanySampleSchema = z.object({
  id: z.number(),
  ordered_at: z.string(),
  status: z.string(),
  customer: z.string(),
  sales_rep: z.string(),
  line_no: z.number(),
  product: z.string(),
  attributes: z.record(z.string(), z.unknown()),
  quantity: z.number(),
  unit_price: z.string(),
});

export const companyRegistry = new OpenAPIRegistry();
export const companyRouter: Router = express.Router();

companyRegistry.register("CompanySample", CompanySampleSchema);

companyRegistry.registerPath({
  method: "get",
  path: "/Company/sampleData",
  tags: ["Company"],
  responses: createApiResponse(z.array(CompanySampleSchema), "Success"),
});

const getSample: RequestHandler = async (_req: Request, res: Response) => {
  const result = await executeQuery(companySampleQuery);
  return handleServiceResponse(ServiceResponse.success<any[]>("Company sample found", result.rows), res);
};

companyRouter.get("/sampleData", getSample);
