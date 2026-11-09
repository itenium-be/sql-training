import { config } from "../config";
import { SqlSchema } from "./schema";

const schemaCache = new Map<string, Promise<SqlSchema>>();

export function loadSchema(game: string): Promise<SqlSchema> {
  if (!schemaCache.has(game)) {
    const request = fetch(`${config.api}/exercises/schema?game=${encodeURIComponent(game)}`)
      .then(res => res.json())
      .then(data => (data.success ? data.responseObject : {}) as SqlSchema)
      .catch(() => {
        schemaCache.delete(game);
        return {};
      });
    schemaCache.set(game, request);
  }
  return schemaCache.get(game)!;
}
