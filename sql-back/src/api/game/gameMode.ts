export const gameModes = ["init", "running", "end"] as const;
export type GameMode = (typeof gameModes)[number];

export function parseGameMode(value: string | undefined): GameMode {
  return gameModes.find((mode) => mode === value) ?? "init";
}
