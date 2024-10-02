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
});
