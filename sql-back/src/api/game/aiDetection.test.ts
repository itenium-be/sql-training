import { describe, expect, test } from "bun:test";
import { type AiSubmission, aiSuspects, parseTelemetry, type Telemetry } from "./aiDetection";

const T0 = Date.parse("2026-11-27T10:00:00Z");
const at = (seconds: number) => new Date(T0 + seconds * 1000);

const SOLUTION = "SELECT name FROM country WHERE continent = 'Africa'";

const typed = (overrides: Partial<Telemetry> = {}): Telemetry => ({
  keys: SOLUTION.length,
  unkeyedChars: 0,
  maxInsert: 0,
  hiddenEdits: 0,
  awayMs: 0,
  keyGapCv: 0.6,
  webdriver: false,
  ...overrides,
});

const submission = (overrides: Partial<AiSubmission> = {}): AiSubmission => ({
  player: "alice",
  game: "World",
  exerciseId: 1,
  solution: SOLUTION,
  correct: true,
  submittedAt: at(300),
  telemetry: typed(),
  secFetchSite: "same-origin",
  userAgent: "Mozilla/5.0",
  ...overrides,
});

const starts = [{ player: "alice", game: "World", exerciseId: 1, firstStart: at(0) }];

const suspects = (submissions: AiSubmission[]) => aiSuspects(submissions, starts);

describe("aiSuspects hard tells", () => {
  test("an honest typed solve lists no one", () => {
    expect(suspects([submission()])).toEqual([]);
  });

  test("a submit without Sec-Fetch lists the player as a script", () => {
    const [s] = suspects([submission({ secFetchSite: null, userAgent: "curl/8.5.0" })]);
    expect(s.tells.script).toBe(true);
    expect(s.nonBrowserUas).toEqual(["curl/8.5.0"]);
  });

  test("a correct browser submit without telemetry is listed", () => {
    const [s] = suspects([submission({ telemetry: null })]);
    expect(s.tells.missingTelemetry).toBe(true);
  });

  test("webdriver is listed", () => {
    const [s] = suspects([submission({ telemetry: typed({ webdriver: true }) })]);
    expect(s.tells.webdriver).toBe(true);
  });

  test("80% unkeyed on a correct solution is listed", () => {
    const unkeyedChars = Math.ceil(SOLUTION.length * 0.8);
    const [s] = suspects([submission({ telemetry: typed({ unkeyedChars }) })]);
    expect(s.tells.unkeyed).toBe(true);
  });

  test("79% unkeyed is not listed", () => {
    const unkeyedChars = Math.floor(SOLUTION.length * 0.79);
    expect(suspects([submission({ telemetry: typed({ unkeyedChars }) })])).toEqual([]);
  });

  test("a mostly unkeyed incorrect submit is not listed", () => {
    const telemetry = typed({ unkeyedChars: SOLUTION.length });
    expect(suspects([submission({ correct: false, telemetry })])).toEqual([]);
  });

  test("an edit while hidden is listed", () => {
    const [s] = suspects([submission({ correct: false, telemetry: typed({ hiddenEdits: 1 }) })]);
    expect(s.tells.hidden).toBe(true);
  });

  test("submissions from before telemetry count as unknown and list no one", () => {
    const old = submission({ telemetry: null, secFetchSite: null, userAgent: null });
    expect(suspects([old])).toEqual([]);
  });
});

describe("aiSuspects soft tells", () => {
  const quick = submission({ submittedAt: at(5) });
  const away = submission({ telemetry: typed({ awayMs: 60_000 }) });
  const robotic = submission({ telemetry: typed({ keyGapCv: 0.05 }) });

  test("too quick, away and robotic cadence together never list a player", () => {
    expect(suspects([quick, away, robotic])).toEqual([]);
  });

  test("each adds to the score of a listed player", () => {
    const script = { secFetchSite: null };
    const plain = suspects([submission(script)])[0];
    const soft = suspects([
      submission({ ...script, submittedAt: at(5), telemetry: typed({ awayMs: 60_000, keyGapCv: 0.05 }) }),
    ])[0];
    expect(plain.score).toBe(70);
    expect(soft.score).toBe(100);
    expect(soft.tells).toMatchObject({ tooQuick: true, away: true, robotic: true });
  });

  test("typing faster than a human is too quick", () => {
    const [s] = suspects([submission({ secFetchSite: null, submittedAt: at(25), solution: "x".repeat(500) })]);
    expect(s.tells.tooQuick).toBe(true);
  });

  test("robotic cadence needs enough keys", () => {
    const [s] = suspects([submission({ secFetchSite: null, telemetry: typed({ keys: 10, keyGapCv: 0.01 }) })]);
    expect(s.tells.robotic).toBe(false);
  });
});

describe("aiSuspects per exercise", () => {
  test("solve time is measured from the earliest start", () => {
    const [s] = aiSuspects(
      [submission({ secFetchSite: null, submittedAt: at(120) })],
      [
        { player: "alice", game: "World", exerciseId: 1, firstStart: at(60) },
        { player: "alice", game: "World", exerciseId: 1, firstStart: at(0) },
      ],
    );
    expect(s.exercises[0].solveSeconds).toBe(120);
  });

  test("reports the first correct submit per exercise", () => {
    const [s] = suspects([
      submission({ correct: false, submittedAt: at(100), secFetchSite: null }),
      submission({ submittedAt: at(200), telemetry: typed({ unkeyedChars: 10, awayMs: 5000 }) }),
      submission({ submittedAt: at(300) }),
    ]);
    expect(s.exercises).toEqual([
      {
        game: "World",
        exerciseId: 1,
        solveSeconds: 200,
        charsPerSecond: SOLUTION.length / 200,
        unkeyedPct: Math.round((10 / SOLUTION.length) * 100),
        awayMs: 5000,
        keyGapCv: 0.6,
        client: "browser",
      },
    ]);
    expect(s).toMatchObject({ attempts: 3, correct: 2 });
  });
});

describe("aiSuspects ordering", () => {
  test("sorts by score, then by correct submissions", () => {
    const script = { secFetchSite: null };
    const list = aiSuspects(
      [
        submission({ ...script, player: "few" }),
        submission({ ...script, player: "many" }),
        submission({ ...script, player: "many", exerciseId: 2 }),
        submission({ ...script, player: "quick", submittedAt: at(5) }),
      ],
      [...starts, ...["few", "many", "quick"].map((player) => ({ ...starts[0], player }))],
    );
    expect(list.map((s) => s.player)).toEqual(["quick", "many", "few"]);
  });
});

describe("parseTelemetry", () => {
  test("accepts a complete snapshot", () => {
    expect(parseTelemetry(typed())).toEqual(typed());
  });

  test("accepts a null cadence", () => {
    expect(parseTelemetry(typed({ keyGapCv: null }))).toEqual(typed({ keyGapCv: null }));
  });

  test("rejects anything else", () => {
    expect(parseTelemetry(undefined)).toBeNull();
    expect(parseTelemetry({ keys: 1 })).toBeNull();
    expect(parseTelemetry({ ...typed(), keys: "1" })).toBeNull();
    expect(parseTelemetry({ ...typed(), keys: -1 })).toBeNull();
  });

  test("drops unknown fields", () => {
    expect(parseTelemetry({ ...typed(), extra: 1 })).toEqual(typed());
  });
});
