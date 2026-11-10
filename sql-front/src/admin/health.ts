export type ServiceHealth = { db: boolean; backend: boolean; postgres: boolean; mssql: boolean };
export type Health = ServiceHealth & { leaderboard: boolean };

export const healthDown: Health = { leaderboard: false, db: false, backend: false, postgres: false, mssql: false };

export function healthFrom(reported: ServiceHealth): Health {
  return { ...reported, leaderboard: true };
}
