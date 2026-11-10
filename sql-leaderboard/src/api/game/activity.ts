export type GameMode = "init" | "running" | "end";

export function shouldRecordActivity(mode: GameMode, solved: boolean): boolean {
  return mode === "running" && !solved;
}
