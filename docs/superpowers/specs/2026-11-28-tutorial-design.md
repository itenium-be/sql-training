Tutorial
========

Issue [#11](https://github.com/itenium-be/sql-training/issues/11): explain how the UI works, in the game and in the slides.

A fake cursor walks a registered player through the dashboard and an exercise, on canned demo data.
Mockup: `design/tutorial/index.html`, variant **A · Spotlight**.

## Script

`sql-front/src/tutorial/steps.ts` holds the 19 steps. A click that leaves a screen (Countries, Let's Start) is the next step's `enter`, so it only happens on Next:

1. On the dashboard: the posters, then a click on Countries.
2. On the intro: Example data, Diagram, Let's Start.
3. On the exercise:
   - the question, the expected columns and the schema
   - three wrong submits; each shows *Query result does not match expected output!*, and the third lowers the badge by 1
   - reveal Expected (−1), after which the Your result tab marks the row-order difference
   - Hint (−1), the Sample tab and Give up
   - the correct submit, then the solutions
4. A closing card.

Demo question (Countries, `World`): *European countries with more than 50 million inhabitants, largest first.*

| Attempt | Query flaw           |
| ------- | -------------------- |
| 1       | no population filter |
| 2       | `SELECT *`           |
| 3       | no `ORDER BY`        |
| 4       | correct              |

## Overlay

- Spotlight: everything but the target is dimmed. The caption card sits beside the target, with the controls inside it: step `n/19`, Back, Next, Skip.
- Narrow (≤1100px, the exercise page's own breakpoint): a step uses its `narrowAnchor` when it has one (e.g. the Schema tab instead of the side panel). The card docks at the bottom.
- Touch (`pointer: coarse`): a tap ripple replaces the arrow cursor.
- The target is scrolled into view before the cursor moves.
- The tour only moves on Next / Back (or → / ←); a step stays until then.
- Esc and Skip exit.
- A step whose anchor is missing after 3s is skipped.
- Entering a step first brings the demo to the state after all earlier steps' actions: missing actions replay instantly, and a demo that is ahead (after Back) resets to the dashboard first. Next during a step's animation thus finishes its cut-off actions, and Back over steps without actions resets nothing. Back is disabled on the first step.
- Clicks on the page are blocked; only the card's controls respond.

## Sandbox

`/tutorial` is a full page load, branched in `App.tsx` like `/beamer`, so the game tree, and its polling, never runs alongside it.

At page load, before rendering, the tutorial page replaces:

- `window.fetch`: an in-memory handler for the `/api/*` endpoints that `Dashboard` and `Exercise` call. An `/api` URL it does not know throws, so nothing reaches the server: `/game/start` would start a real timer, `/game/hint` would cost a real point.
- `window.localStorage`: an in-memory `Storage`, so drafts, the token and `userName` stay untouched. If shadowing it with `defineProperty` fails in a browser, `sqlDraft` keys get a namespace instead.

The real `Dashboard` and `Exercise` render inside a `MemoryRouter`, with their own Redux store preloaded as a registered player with canned progress on the four datasets.

The fake API applies the server's scoring rules through `livePoints` and the existing response types, so the badge shows real numbers.

## Starting

- A registered player who opens `/` (`Home`) without `tutorialSeen` in `localStorage` is sent to `/tutorial`.
- A "How it works" card beside Leaderboard and Slides replays it.
- On exit `tutorialSeen` is set in the real `localStorage` and the player goes to `/`.
- `?loop` (the slides): the last step restarts the tour with a fresh store and fake API; Skip is hidden; `tutorialSeen` is never set.

## Slides

A "How it works" slide before "Let's get this party started!" embeds `<iframe src="{gameUrl}/tutorial?loop">`, rendered at 1375px and scaled down so it shows the wide layout.
`gameUrl` comes from the slides frontmatter; behind nginx on the minipc the slides and the game share the origin.

## Placement

| Unit                        | Does                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `tutorial/demoData.ts`      | canned definitions, sample data, schema, the question, the 3 wrong results and the correct one                 |
| `tutorial/fakeApi.ts`       | pure `(url, init) → {status, body}` over `demoData`; tracks attempts, hint, expected and solved                |
| `tutorial/sandbox.ts`       | installs `fakeApi` as `fetch` and the in-memory `localStorage`                                                 |
| `tutorial/steps.ts`         | the script: `{anchor, narrowAnchor?, title, caption, enter?, actions?}`, actions `click \| type`               |
| `tutorial/tourEngine.ts`    | pure: current step, back / next / skip, anchor per layout, how to catch the demo up to a step                  |
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
  - next / back / skip move as named; next on the last step ends the tour
  - a step whose anchor is missing is not playable
  - on narrow screens `narrowAnchor` wins over `anchor`
  - back moves to the previous step and stays put on the first
  - catching up replays only the missing actions, and starts over when the demo is ahead
- `shouldAutoStart`: true only for a registered player without `tutorialSeen`
- every `anchor` and `narrowAnchor` in `steps.ts`, including those of `enter` and `actions`, appears as a `data-tour` value in `sql-front/src`

Browser, at 1375px, 1000px and 390px with touch:
- every step shows its spotlight and a card in view
- the badge reads 6 → 5 → 4 → 3
- no `/api` request reaches the network
- a real draft survives
- the tour ends on `/` with `tutorialSeen` set; with `?loop` it restarts and leaves `tutorialSeen` unset
