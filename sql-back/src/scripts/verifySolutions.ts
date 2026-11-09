import { isCorrect, resolveExpected, runQuery } from "@/api/exercises/checker";
import { exercises } from "@/api/exercises/definitions/exercises";

async function main() {
  const games = process.argv.slice(2);
  let failed = 0;
  for (const game of exercises.filter((g) => !games.length || games.includes(g.id))) {
    for (const ex of game.exercises) {
      try {
        const ok = isCorrect(ex, await resolveExpected(game.id, ex), await runQuery(game.id, ex.solution));
        console.log(`${ok ? "OK  " : "FAIL"} ${game.id}-${ex.id}`);
        failed += ok ? 0 : 1;
      } catch (err: any) {
        console.log(`ERR  ${game.id}-${ex.id}: ${err.message}`);
        failed++;
      }
    }
  }
  process.exit(failed ? 1 : 0);
}

main();
