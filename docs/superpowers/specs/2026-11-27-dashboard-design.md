Dashboard
=========

Issue [#26](https://github.com/itenium-be/sql-training/issues/26): a registered player lands on a dashboard, on every device, instead of the leaderboard.

Mockup: `design/dashboard/A-posters.html` (alternatives B–D in the same folder).

## Layout

1. Stats strip: your rank (`#7 of 42`), total points, `solved/total`.
2. One poster per dataset, the same art and blurb as the slides' "Four playgrounds", plus:
   - a difficulty badge on the art,
   - a progress bar and `solved/total` for you,
   - the database badge (Postgres / SQL Server).
   Clicking opens that dataset's exercise page.
3. Two link cards: Leaderboard (subline: points behind the player above you, or "You lead") and Slides (`/slides/`, new tab).

Posters: 4 columns on desktop, 2 below 900px; blurb hidden below 560px. Link cards stack below 560px.

| Dataset  | Level  | Database   | Blurb                       |
| -------- | ------ | ---------- | --------------------------- |
| World    | Easy   | Postgres   | The basics — one table.     |
| Teachers | Medium | Postgres   | Start joining tables.       |
| Worldcup | Hard   | SQL Server | Many related tables.        |
| Company  | Expert | Postgres   | Query at scale — many rows. |

The poster title is the slides' name (World is shown as "Countries").

## Placement

| Unit                             | Does                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `dashboard/datasets.ts`          | the table above, keyed by `ExerciseId`, plus the image path                                      |
| `dashboard/dashboardSummary.ts`  | pure: `(exercises, scores, you)` → rank, player count, points, solved per dataset, gap to next   |
| `dashboard/Dashboard.tsx` + css  | renders the summary; polls scores like the leaderboard does                                      |

Rank and points come from `rankPlayers`, so they match the leaderboard (awards included).

The poster images are copied from `slides/public/img/game-*.png` into `sql-front/public/img/`.

## Routing

- `/` renders the dashboard for a registered player (the unregistered branch of `Home` stays).
- `/leaderboard` renders the current leaderboard (`<Beamer />`).
- Top tabs: the Leaderboard tab links to `/leaderboard`; the tab bar is hidden below 576px, the dashboard is the mobile navigation. The brand links to `/`.

## Testing

`bun test` on `dashboardSummary`:

- rank and points equal the player's row in `rankPlayers`.
- solved per dataset counts only your scores in that dataset; total is that dataset's exercise count.
- a player without scores gets no rank, 0 points, 0 solved everywhere.
- gap to next is the total difference to the player ranked just above; the leader gets none.
