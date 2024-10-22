import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { worldRouter } from "./api/world/worldRouter";
import { exRouter } from "./api/exercises/exRouter";
import { teacherRouter } from "./api/teacher/teacherRouter";
import { worldcupRouter } from "./api/worldcup/woldcupRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

console.log('config', env);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/exercises", exRouter);
app.use("/World", worldRouter);
app.use("/Teachers", teacherRouter);
app.use("/Worldcup", worldcupRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

process.on('uncaughtException', (error) => {
  console.error('Unhandled Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app, logger };
