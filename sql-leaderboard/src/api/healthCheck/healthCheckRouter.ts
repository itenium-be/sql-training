import express, { type Request, type Response, type Router } from "express";

export const healthCheckRouter: Router = express.Router();

healthCheckRouter.get("/", (_req: Request, res: Response) => {
  return res.status(200).send({message: 'Healthy'})
});
