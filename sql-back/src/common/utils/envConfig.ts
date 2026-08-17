import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(8080) }),

  PG_USER: str({ devDefault: testOnly("admin") }),
  PG_PASSWORD: str({ devDefault: testOnly("password") }),
  PG_HOST: host({ devDefault: testOnly("localhost") }),
  PG_PORT: port({ devDefault: testOnly(5175) }),

  // Read only role that runs the SQL the players type in.
  // Created by sql-data/postgres-roles.sql, see README.
  PG_PLAYER_USER: str({ default: "player" }),
  PG_PLAYER_PASSWORD: str({ default: "player" }),

  SQL_SERVER_HOST: host({ devDefault: testOnly("localhost") }),
  SQL_SERVER_PORT: port({ devDefault: testOnly(5174) }),
  SQL_SERVER_USER: str({ default: "sa" }),
  SQL_SERVER_PASSWORD: str({ default: "password123!" }),

  /** A runaway cartesian join should not take the shared server down with it. */
  QUERY_TIMEOUT_MS: num({ default: 10000 }),
  /** Nobody reads 50k rows in the browser anyway. */
  QUERY_MAX_ROWS: num({ default: 500 }),
  /** Longest SQL statement we accept. */
  QUERY_MAX_LENGTH: num({ default: 5000 }),
});
