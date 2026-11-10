import type { GameMode } from "./gameMode";

export function shouldRecordActivity(mode: GameMode, solved: boolean): boolean {
  return mode === "running" && !solved;
}
