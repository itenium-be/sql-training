export type DbHealth = { game: boolean; postgres: boolean; mssql: boolean };
export type Health = DbHealth & { api: boolean };

export const healthDown: Health = { api: false, game: false, postgres: false, mssql: false };

export function healthFrom(reported: DbHealth): Health {
  return { ...reported, api: true };
}
