import { grade, grader, isCorrect, resolveExpected, runQuery } from "@/api/exercises/checker";
import { exercises } from "@/api/exercises/definitions/exercises";
import { knownCheats } from "./knownCheats";

async function verifyExercises(games: string[]) {
  let failed = 0;
  for (const game of exercises.filter((g) => !games.length || games.includes(g.id))) {
    for (const ex of game.exercises) {
      try {
        const expected = await resolveExpected(game.id, ex);
        const reference = await runQuery(game.id, ex.solution);
        const shadow = await runQuery(game.id, ex.solution, "shadow");
        const problem = !isCorrect(ex, expected, reference, reference.columns)
          ? "solution does not match expected"
          : !shadow.rows.length
            ? "shadow result is empty"
            : isCorrect(ex, expected, shadow, reference.columns)
              ? "shadow result equals the real result"
              : null;
        console.log(`${problem ? "FAIL" : "OK  "} ${game.id}-${ex.id}${problem ? `: ${problem}` : ""}`);
        failed += problem ? 1 : 0;
      } catch (err: any) {
        console.log(`ERR  ${game.id}-${ex.id}: ${err.message}`);
        failed++;
      }
    }
  }
  return failed;
}

async function verifyCheats(games: string[]) {
  let failed = 0;
  for (const cheat of knownCheats.filter((c) => !games.length || games.includes(c.game))) {
    const ex = exercises.find((g) => g.id === cheat.game)!.exercises.find((e) => e.id === cheat.exerciseId)!;
    const label = `${cheat.game}-${cheat.exerciseId} cheat ${cheat.query.split("\n")[0]}`;
    try {
      const reference = await runQuery(cheat.game, ex.solution);
      const { verdict } = await grade(ex, grader(cheat.game, ex, cheat.query, reference.columns));
      // "wrong" means the cheat no longer passes on the real data, so it proves nothing about the shadow data.
      const ok = verdict === "dataDependent";
      console.log(`${ok ? "OK  " : "FAIL"} ${label}: ${verdict}`);
      failed += ok ? 0 : 1;
    } catch (err: any) {
      console.log(`ERR  ${label}: ${err.message}`);
      failed++;
    }
  }
  return failed;
}

async function main() {
  const games = process.argv.slice(2);
  const failed = (await verifyExercises(games)) + (await verifyCheats(games));
  process.exit(failed ? 1 : 0);
}

main();
