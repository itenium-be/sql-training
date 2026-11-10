export const gameModes = ["init", "running", "end"] as const;
export type GameMode = (typeof gameModes)[number];

export function parseGameMode(value: string | undefined): GameMode {
  return gameModes.find((mode) => mode === value) ?? "init";
}

let current: GameMode = "init";

export function getGameMode(): GameMode {
  return current;
}

export function setGameMode(mode: GameMode) {
  current = mode;
}

export function startRefusal(mode: GameMode): string | null {
  return mode === "init" ? "Game has not yet started!" : null;
}
