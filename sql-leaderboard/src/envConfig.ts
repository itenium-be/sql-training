import dotenv from "dotenv";
import { cleanEnv, host, port, str, url } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ testDefault: "test", choices: ["development", "production", "test"] }),
  HOST: host({ testDefault: "localhost" }),
  PORT: port({ testDefault: 8000 }),
  API_KEY: str({ testDefault: 'secret' }),
  BACK_END_URL: url({ testDefault: "http://localhost:8080" }),
  INTERNAL_API_KEY: str({ testDefault: "internal" }),

  PG_USER: str({ testDefault: "admin" }),
  PG_PASSWORD: str({ testDefault: "password" }),
  PG_HOST: host({ testDefault: "localhost" }),
  PG_PORT: port({ testDefault: 6000 }),
});
