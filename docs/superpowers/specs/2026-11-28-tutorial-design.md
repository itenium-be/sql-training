Tutorial
========

Issue [#11](https://github.com/itenium-be/sql-training/issues/11): explain how the UI works, in the game and in the slides.

A fake cursor walks a registered player through the dashboard and an exercise, on canned demo data.
Mockup: `design/tutorial/index.html`, variant **A · Spotlight**.

## Script

| #  | Screen      | Anchor                    | Cursor                              | Caption (gist)                                                   |
| -- | ----------- | ------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| 1  | Dashboard   | posters                   | hover                               | Four playgrounds: difficulty, database, your progress            |
| 2  | Dashboard   | links                     | hover                               | Your standing; rules & prizes                                    |
| 3  | Dashboard   | Countries poster          | click                               | —                                                                |
| 4  | Intro       | Example Data tab          | click                               | Sample query + rows: know the data before you start              |
| 5  | Intro       | Diagram tab               | click                               | How the tables relate                                            |
| 6  | Intro       | Let's Start               | click                               | The clock starts when you first open a question                  |
| 7  | Exercise    | question card + points    | hover                               | Max points; the badge drops as you spend                         |
| 8  | Exercise    | expected columns          | hover                               | Exactly these columns; whether order counts                      |
| 9  | Exercise    | schema panel / Schema tab | hover                               | Tables & columns; the editor autocompletes them                  |
| 10 | Exercise    | editor + Run              | type + click, 3 times               | The diff shows what's off; every 3 wrong attempts = −1           |
| 11 | Exercise    | Hint                      | click                               | −1                                                               |
| 12 | Exercise    | 🔒 Expected tab           | click                               | The target result, −1                                            |
| 13 | Exercise    | Sample data / Diagram tab | click                               | Same as the intro, always at hand                                |
| 14 | Exercise    | editor + Run              | type + click                        | Solved; Fastest / Shortest / Leanest; others' solutions          |
| 15 | Exercise    | Give up / Next            | hover                               | Give up = 0 points, but you see the solution                     |
| 16 | Dashboard   | —                         | —                                   | Go!                                                              |

Demo question (Countries, `world`): *European countries with more than 50 million inhabitants, largest first.*

| Attempt | Query flaw           | The player sees                               |
| ------- | -------------------- | --------------------------------------------- |
| 1       | no population filter | the diff marks extra rows                     |
| 2       | `SELECT *`           | a column mismatch with the expected columns   |
| 3       | no `ORDER BY`        | the diff marks row order; the badge drops 1   |
| 4       | correct              | solved                                        |

## Overlay

- Spotlight: everything but the target is dimmed. The caption card sits beside the target, with the controls inside it: step `n/16`, Back, Pause, Next, Skip.
- Narrow (≤1100px, the exercise page's own breakpoint): a step uses its `narrowAnchor` when it has one (e.g. the Schema tab instead of the side panel). The card docks at the bottom.
- Touch (`pointer: coarse`): a tap ripple replaces the arrow cursor.
- The target is scrolled into view before the cursor moves.
- A step stays on screen for 60ms per caption character, at least 2.5s, or until Next.
- Esc and Skip exit.
- A step whose anchor is missing in the current layout is skipped.

## Sandbox

`/tutorial` is a full page load, branched in `App.tsx` like `/beamer`, so the game tree, and its polling, never runs alongside it.

At page load, before rendering, the tutorial page replaces:

- `window.fetch`: an in-memory handler for the `/api/*` endpoints that `Dashboard` and `Exercise` call. An `/api` URL it does not know throws, so nothing reaches the server: `/game/start` would start a real timer, `/game/hint` would cost a real point.
- `window.localStorage`: an in-memory `Storage`, so drafts, the token and `userName` stay untouched. If shadowing it with `defineProperty` fails in a browser, `sqlDraft` keys get a namespace instead.

The real `Dashboard` and `Exercise` render inside a `MemoryRouter`, with their own Redux store preloaded as a registered player with canned progress on the four datasets.

The fake API applies the server's scoring rules through `livePoints` and the existing response types, so the badge shows real numbers.

## Starting

- A registered player who opens the dashboard without `tutorialSeen` in `localStorage` is sent to `/tutorial`.
- A "How it works" card beside Leaderboard and Slides replays it.
- On exit `tutorialSeen` is set in the real `localStorage` and the player goes to `/`.
- `?autoplay&loop` (the slides) wraps from the last step to the first and never sets `tutorialSeen`.

## Slides

A "How it works" slide before "Let's get this party started!" embeds `<iframe src="{gameUrl}/tutorial?autoplay&loop">`.
`gameUrl` comes from the slides frontmatter; behind nginx on the minipc the slides and the game share the origin.

## Placement

| Unit                        | Does                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `tutorial/demoData.ts`      | canned definitions, sample data, schema, the question, the 3 wrong results and the correct one                 |
| `tutorial/fakeApi.ts`       | pure `(url, init) → {status, body}` over `demoData`; tracks attempts, hint, expected and solved                |
| `tutorial/sandbox.ts`       | installs `fakeApi` as `fetch` and the in-memory `localStorage`                                                 |
| `tutorial/steps.ts`         | the script: `{anchor, narrowAnchor?, action: hover \| click \| type, text?, caption}`                          |
| `tutorial/tourEngine.ts`    | pure: current step, play / pause / back / next / skip, missing-anchor skip, loop                              |
| `tutorial/autoStart.ts`     | pure `shouldAutoStart(storage, registered)`                                                                    |
| `tutorial/TourPlayer.tsx`   | spotlight, cursor or tap ripple, caption card; fires real DOM clicks; types into CodeMirror via `EditorView`   |
| `tutorial/Tutorial.tsx`     | the page: sandbox, store, `MemoryRouter`, `Dashboard` / `Exercise`, `TourPlayer`                               |
| `data-tour` attributes      | on the anchored elements in `Dashboard`, `GamePoster`, `Exercise` and its panels                               |

## Testing

`bun test`:

- `fakeApi`
  - every 3rd wrong check lowers the exercise's points by 1
  - hint and expected each lower them by 1, once
  - the correct query solves the exercise
  - an `/api` URL outside its table throws
- `tourEngine`
  - next / back / pause / skip move as named; back on the first step stays there
  - a step whose anchor is missing is skipped
  - on narrow screens `narrowAnchor` wins over `anchor`
  - with `loop` the last step wraps to the first; without it the tour ends
- `shouldAutoStart`: true only for a registered player without `tutorialSeen`
- every `anchor` and `narrowAnchor` in `steps.ts` appears as a `data-tour` value in `sql-front/src`

Browser (`browser_evaluate`, at 1375px and 390px): every step resolves its target and the fake fetch saw no unknown URL.
