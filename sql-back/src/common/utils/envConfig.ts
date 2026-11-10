import dotenv from "dotenv";
import { cleanEnv, host, port, str } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ testDefault: "test", choices: ["development", "production", "test"] }),
  HOST: host({ testDefault: "localhost" }),
  PORT: port({ testDefault: 8080 }),

  PG_USER: str({ testDefault: "admin" }),
  PG_PASSWORD: str({ testDefault: "password" }),
  PG_HOST: host({ testDefault: "localhost" }),
  PG_PORT: port({ testDefault: 5175 }),

  SQL_SERVER_HOST: host({ testDefault: "localhost" }),
  SQL_SERVER_PORT: port({ testDefault: 5174 }),
  SQL_SERVER_USER: str({ testDefault: "player" }),
  SQL_SERVER_PASSWORD: str({ testDefault: "Player123!" }),

  API_KEY: str({ testDefault: "secret" }),

  GAME_PG_USER: str({ testDefault: "admin" }),
  GAME_PG_PASSWORD: str({ testDefault: "password" }),
  GAME_PG_HOST: host({ testDefault: "localhost" }),
  GAME_PG_PORT: port({ testDefault: 6000 }),
});
