import type { GameMode } from "./gameMode";

export function shouldRecordActivity(mode: GameMode, solved: boolean): boolean {
  return mode === "running" && !solved;
}

export function canSeeSolutions(mode: GameMode, exercise: { solved: boolean; gaveUp: boolean }): boolean {
  return mode === "end" || exercise.solved || exercise.gaveUp;
}
