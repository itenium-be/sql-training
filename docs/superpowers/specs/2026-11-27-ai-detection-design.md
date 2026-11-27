# AI detection

[Issue #13](https://github.com/itenium-be/sql-training/issues/13). This spec detects players who
let an AI solve exercises, whether they paste its answer, script the API, or let an agent drive the
browser. An **AI** tab in the admin lists the suspects. The approach is ported from the CTF game's
`portal-backend/admin/aiDetection.ts` (Bootcamp-Security): a player is listed only on a hard tell,
and soft tells only rank, so a fast human is never accused.

## Signals

| Signal                  | Source                                                                                      | Kind |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---- |
| Script submit           | `POST /game/check` without a `Sec-Fetch-Site` header                                         | hard |
| Missing telemetry       | a correct submit with no `telemetry` in the body                                             | hard |
| WebDriver               | `telemetry.webdriver === true`                                                               | hard |
| Unkeyed solution        | `unkeyedChars >= 80%` of a correct solution's length                                          | hard |
| Input while hidden      | `telemetry.hiddenEdits > 0` on any submit                                                     | hard |
| Too quick               | correct within 20 s of the first `game_start`, or `solution.length / solveSeconds > 15`        | soft |
| Away                    | `telemetry.awayMs` on the correct submit                                                     | soft |
| Robotic cadence         | `telemetry.keyGapCv < 0.15` with `keys >= 20`                                                | soft |

The thresholds (80%, 20 s, 15 chars/s, 0.15, 20 keys) are named constants in `aiDetection.ts`. They
will be tuned after the first session.

`Sec-Fetch-*` headers are set by the browser and cannot be suppressed by page JS, so their absence
means the request did not come from the page. Agents that drive a real browser (Claude in Chrome,
Operator, Playwright) do send Sec-Fetch. They are caught instead by WebDriver, by unkeyed
input, by input while the tab is hidden, and by cadence. An agent that sends OS-level keystrokes
with human timing passes everything except Too quick and cadence.

## Client telemetry

`SqlEditor` keeps counters per exercise, accumulated from its first open, in `sessionStorage` keyed
by `game/exerciseId` so a reload does not wipe them.

| Counter        | Meaning                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------- |
| `keys`         | keydowns that produced a character or accepted a completion                                    |
| `unkeyedChars` | characters inserted by a transaction with no keydown since the previous transaction          |
| `maxInsert`    | the largest number of characters a single unkeyed transaction inserted                        |
| `hiddenEdits`  | document-changing transactions while `document.hidden` or `!document.hasFocus()`              |
| `awayMs`       | total time `document.hidden` while the exercise was open                                     |
| `keyGapCv`     | stddev / mean of the last 200 gaps between keystrokes, ignoring gaps over 2 s; `null` under 20 keys |
| `webdriver`    | `navigator.webdriver === true`                                                                 |

Insertions are classified by keydown, not by CodeMirror's `userEvent`. A CDP `Input.insertText`
reaches CodeMirror as ordinary DOM input and is annotated `input.type`, just like typing. Paste,
drop, and a script dispatching into the view have no keydown either, so all of them count as
unkeyed. Autocomplete and auto-closed brackets follow a keydown, so they count as keyed.

The client sends a snapshot of the counters with every `POST /game/check` as `telemetry`. A
failure to collect telemetry never blocks a submit.

## Storage

The migration adds to `submissions`:

| Column         | Type         |
| -------------- | ------------ |
| `telemetry`    | JSONB NULL   |
| `secFetchSite` | VARCHAR(20)  |
| `userAgent`    | TEXT         |

`checkExercise` writes all three. Submissions made before this change have all three null and count
as **unknown**: neither a script nor missing telemetry.

## Detection

`aiDetection.ts` in `sql-back/src/api/game` holds a pure function over the submissions and the
first `game_start` per player+exercise. It returns `AiSignals` per player:

- counts: attempts, correct, script submits, unknown submits
- hard tells: script, missing telemetry, webdriver, unkeyed solution, input while hidden
- per exercise: solve seconds, chars/s, unkeyed %, `awayMs`, `keyGapCv`, client type
  (`browser` / `script` / `unknown`), non-browser user agents
- `score` from 0 to 100: 70 for hard tells (any hard tell present → 70), plus up to 30 from soft
  tells, split evenly between Too quick, Away (≥ 30 s), and Robotic cadence

`aiSuspects` keeps only players with a hard tell, sorted by score, then by correct submissions.

`GET /game/admin/ai-detection` is behind the admin API key. It returns `aiSuspects` along with each
player's avatar and disqualified flag.

## Admin: AI tab

This is the fourth tab after Overview, Players and Exercises. It shows one row per suspect: avatar,
name, `correct/attempts`, badges for each tell (hard in red, soft in amber), and the score in large
digits, red at 50 or more. Expanding a row shows a per-exercise table:

| Exercise | Solve time | Chars/s | Unkeyed % | Away | Cadence CV | Client |

Each row includes the existing disqualify toggle. With no suspects the tab shows
"No AI players flagged." The footer reads: "Listed on a hard tell only. Speed, time away and cadence
only rank."

## Testing

`bun:test` in every package. The query runner and the clock are faked where needed.

Detection (`aiDetection.test.ts`):

- Each hard tell on its own lists the player: a submit without Sec-Fetch, a correct submit without
  telemetry, `webdriver: true`, 80% unkeyed on a correct solution, `hiddenEdits: 1`.
- Too quick, Away and Robotic cadence, alone or together, never list a player.
- 79% unkeyed does not list; 80% does.
- An incorrect, mostly unkeyed submit does not trigger the unkeyed tell.
- Submissions with null telemetry, Sec-Fetch and user agent count as unknown and list no one.
- Solve time is measured from the earliest `game_start` for that player+exercise.
- Suspects are sorted by score, then by correct submissions.

Endpoint:

- `POST /game/check` stores `telemetry`, `secFetchSite` and `userAgent` on the submission row.
- `GET /game/admin/ai-detection` returns 401 without the admin key.

Editor telemetry (`SqlEditor` counters, driven through a CodeMirror `EditorView`):

- Typed characters with keydowns count as `keys`, never as `unkeyedChars`.
- A paste, and a `view.dispatch` insert with no keydown, add to `unkeyedChars` and `maxInsert`.
- An accepted completion after a Tab keydown counts as keyed.
- An edit while `document.hidden` increments `hiddenEdits`.
- `keyGapCv` is `null` under 20 keys and near 0 for evenly spaced keys.
- The counters survive a reload of the same exercise.

Admin tab: a render test. A suspect shows its badges and score, and an empty list shows the empty
message.

## Out of scope

Automatic disqualification, mouse-movement heuristics, and server-side keystroke logs.
