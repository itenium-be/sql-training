import { config } from "../config";
import { SqlSchema } from "./schema";

const schemaCache = new Map<string, Promise<SqlSchema>>();

export function loadSchema(game: string): Promise<SqlSchema> {
  const key = game === 'Worldcup' ? 'mssql' : 'pg';
  if (!schemaCache.has(key)) {
    const request = fetch(`${config.api}/exercises/schema?game=${encodeURIComponent(game)}`)
      .then(res => res.json())
      .then(data => (data.success ? data.responseObject : {}) as SqlSchema)
      .catch(() => {
        schemaCache.delete(key);
        return {};
      });
    schemaCache.set(key, request);
  }
  return schemaCache.get(key)!;
}
