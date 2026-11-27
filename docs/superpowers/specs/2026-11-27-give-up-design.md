# Give up, and see the other solutions

A player who is stuck can give up on an exercise. Giving up shows the solutions but forfeits
every point for that exercise. A player who solved an exercise sees the same solutions.

## Flow

- The exercise nav shows `[🏳 Give up] [Skip]` while an exercise is open, and `[Next]` once it is
  solved or given up. Previous is removed.
- Give up opens a modal: "You'll see the reference solution and the current fastest, shortest and
  leanest queries. You won't be able to score on this exercise any more." with *Keep trying* and
  *Give up*.
- A given-up exercise shows a grey banner, the solutions panel and *Next question*. There is no
  editor.
- A solved exercise shows the green banner and the same solutions panel.

## Solutions panel

Stacked cards:

1. Yours, if solved: the query, elapsed time, points and result rows, plus the award tags
   you hold.
2. Reference: the definition's `solution`.
3. One card per other award holder (fastest, shortest, leanest). A player who holds several
   awards gets one card with all their tags. The holders are live while the game runs.

## Backend

| Change                | Detail                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Migration             | `exercise_activity.gaveUp BOOLEAN NOT NULL DEFAULT FALSE`                                              |
| `POST /game/giveup`   | Requires a start and refuses a solved exercise (409). Sets `gaveUp` only while `running`.               |
| `POST /game/check`    | Records only while `running`, the exercise is unsolved and it has not been given up                     |
| `GET /game/solutions` | Allowed when solved, given up, or in `end` mode, else 403. Returns `{reference, solutions: [{player, solution}]}` |
| `GET /game/me`        | Activity rows carry `gaveup`                                                                          |

`/game/solutions` returns every solver's SQL for that one exercise; the frontend picks the award
holders with the existing award calculations. Players only see it after they can no longer score.

## Frontend

- The store holds the player's given-up exercises, loaded from `/game/me` together with the scores.
- The exercise grid gets a `df-ex-gaveup` state (dashed, struck through).
- Resuming a playground counts given-up exercises as done. Solved counts, the dashboard and the
  leaderboard do not.

## Testing

- `bun test`, as in both packages.
- Solutions are visible when solved, when given up, and in `end` mode; never while the exercise is open.
- A correct query after giving up is not recorded.
- Resuming a playground lands after the highest solved or given-up exercise.
- The solution cards: yours first carrying your award tags, then the reference, then each other
  award holder once with all their tags.
