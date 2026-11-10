Admin overview
==============

The admin page is a login + a mode switch + a flat submissions browser. It gives the host no read
on the room: who is here, who is stuck, which exercise is killing everyone, what the solutions were.
This replaces it with a tabbed, phase-aware control panel.

Mockup: `/tmp` throwaway during brainstorming — not committed. The layout it settled on is described
below.

## Shell

A sticky header carries the existing **mode switch** (Lobby / Running / Ended → `init` / `running` /
`end`), **API + DB health** dots, and the **Open beamer** link. Below it, three tabs:
**Overview · Players · Exercises**.

`Admin.tsx` keeps owning auth (API key in `localStorage`) and the mode switch. The authorized body
becomes the header + tabs; `AdminSubmissions.tsx` is deleted, its content reshaped into the Exercises
tab.

## Overview tab — phase-aware

One tab whose body follows the current game mode:

| Mode      | Body                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| `init`    | registered count, avatars-chosen count, exercises-loaded count, who's-here chips   |
| `running` | active/idle counts, submissions-per-minute, fully-solved count, "where the room is stuck" table, live activity feed |
| `end`     | winner, hardest exercise, total submissions + % correct, podium (top 3)            |

"Where the room is stuck" ranks exercises by solve rate (`solvedBy / attemptedBy`) ascending, so the
exercise nobody is getting sits on top. The activity feed is the most recent submissions and hint
uses, newest first.

## Players tab

A card per registered player: avatar, name, points, solved-count, hints-used, a live/idle/never-active
badge, and a ten-cell progress strip.

The core is the **stuck-on list** — one row per exercise the player has *started but not solved*
(`game_start` minus `game_progress`), because a player can have several in flight at once. Each row:

| Column       | Source                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Stuck on     | exercise id + description                                              |
| Running      | now − earliest `game_start.startTime` for that player+exercise          |
| Wrong        | count of `submissions` with `correct = false`, + age of the most recent |
| Last typing  | now − `exercise_activity.lastActiveAt` (the new signal, see below)      |

Last-typing renders as an activity dot: green < 30 s, amber < 5 min, grey ≥ 5 min (idle). A card with
any stuck row at grey is flagged. This is what separates "head down, typing" from "stuck and gone
quiet" — the moment the host wants to step in.

## Exercises tab

The old submissions browser, inverted to be exercise-first and always available (every mode, not just
`end`). An awards table — the same shape as the beamer's: **Solved · Fastest · Shortest · Leanest** —
reusing `scoreCalculations` (`calculateFastest`, `calculateShortest`, leanest/reads) so the numbers
match the projector exactly. Each row expands to the **reference solution** (from
`GET /exercises/solutions`) followed by the winning solution cards (shortest / leanest / fastest),
styled like the beamer's `SolutionCard`.

Solutions are host-only (behind the admin API key), so showing them in every mode is fine; the player
and beamer gating is unchanged.

## The one new signal: typing activity

Everything above reads existing tables except **Last typing**. Today the editor's squiggle check
(`POST /exercises/validate`) goes straight to `sql-back`, unauthenticated and unrecorded, so there is
no per-player "still working" signal.

- **Schema**: add `lastActiveAt TIMESTAMP` to `exercise_activity`.
- **Endpoint**: `POST /game/activity` on the leaderboard, `requirePlayer`, body `{ game, exerciseId }`.
  While `gameMode === "running"` and the exercise is unsolved, it upserts `exercise_activity`
  (same `ON CONFLICT` shape the hint/attempts writes already use) setting `lastActiveAt = NOW()`.
  Outside those conditions it is a no-op 200.
- **Frontend**: `SqlEditor` fires this ping from the same place it validates, throttled to at most one
  per 20 s per exercise, so the linter's chatter does not hammer the leaderboard. The ping is
  fire-and-forget; a failure never disturbs editing or validation.

The squiggle `validate` call itself is untouched — the ping is a separate, additive concern.

## Admin data endpoints

- Extend the admin read (rename `GET /game/admin/submissions` → `GET /game/admin/overview`, or add
  alongside) to return, in one authorized payload: players (with avatar, points, solved count, hints,
  per-exercise start times, wrong counts + last-wrong, `lastActiveAt`), the reference solutions, and
  the raw scored progress the awards are computed from. The frontend derives the per-tab views; the
  server stays a thin aggregator.
- Health dots: a `GET /game/admin/health` (or a field on the overview payload) reporting back-end and
  DB reachability — the leaderboard already calls both.

## Testing

`bun:test` in every package (`describe` / `test` / `expect`), matching the existing suites; no new
framework. Pure derivation logic is unit-tested, the endpoint's mode-gating is tested against its
handler, and the React tabs get render tests like the existing `*.test.ts`.

Observable behaviour the tests must pin:

- The stuck-on list contains exactly the exercises a player has started and not solved; a solved
  exercise never appears, an unstarted one never appears.
- "Running" is measured from the *earliest* start for that player+exercise, not the latest.
- "Wrong" counts only `correct = false` submissions and reports the most recent one's age.
- The activity dot is green below 30 s, amber below 5 min, grey at or above 5 min; a card with any
  grey stuck row is flagged.
- `POST /game/activity` records `lastActiveAt` only when the game is `running` and the exercise is
  unsolved; in `init`, in `end`, or for an already-solved exercise it changes nothing and still
  returns 200.
- The activity ping is throttled: rapid edits produce at most one write per 20 s per exercise.
- The Exercises awards (fastest / shortest / leanest) equal what `scoreCalculations` produces for the
  same scores, so admin and beamer never disagree.
- The Overview body matches the game mode: `init` shows registration, `running` shows the live pulse,
  `end` shows the podium.
- Reference and winning solutions are present on the Exercises tab in `init`, `running` and `end`.

## Out of scope

The standalone per-player / per-question submissions browser is removed, not ported — the Exercises
tab (per exercise) and the Players stuck-list (per player) cover the same ground. No change to the
player-facing app, the beamer, scoring, or solution gating beyond what is listed here.
