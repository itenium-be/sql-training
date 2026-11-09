export function originFromElapsed(serverElapsedSeconds: number, now: number): number {
  return now - serverElapsedSeconds * 1000;
}

export function secondsSince(origin: number, now: number): number {
  return Math.floor((now - origin) / 1000);
}
