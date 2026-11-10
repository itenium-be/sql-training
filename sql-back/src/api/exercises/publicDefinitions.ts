import { penalties } from "./checker";
import type { ExerciseModel } from "./definitions/models";

export function publicDefinitions(games: ExerciseModel[], reveal: boolean) {
  return games.map((game) => ({
    ...game,
    exercises: game.exercises.map((ex) => ({
      id: ex.id,
      points: ex.points,
      hasHint: !!ex.hints,
      ...penalties(ex),
      ...(reveal && { desc: ex.desc, expectedColumns: ex.expectedColumns, expectedOrder: ex.expectedOrder }),
    })),
  }));
}

export function exerciseDetails(games: ExerciseModel[], game: string, exerciseId: number) {
  const ex = games.find((g) => g.id === game)?.exercises.find((e) => e.id === exerciseId);
  return ex && { desc: ex.desc, expectedColumns: ex.expectedColumns, expectedOrder: ex.expectedOrder };
}
