const UNKEYED_RATIO = 0.8;
const QUICK_SECONDS = 20;
const MAX_HUMAN_CHARS_PER_SECOND = 15;
const AWAY_MS = 30_000;
const ROBOTIC_CV = 0.15;
const MIN_KEYS_FOR_CADENCE = 20;

export type Telemetry = {
  keys: number;
  unkeyedChars: number;
  maxInsert: number;
  hiddenEdits: number;
  awayMs: number;
  keyGapCv: number | null;
  webdriver: boolean;
};

const COUNTERS = ["keys", "unkeyedChars", "maxInsert", "hiddenEdits", "awayMs"] as const;

const isCount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

export function parseTelemetry(body: any): Telemetry | null {
  if (!body || typeof body !== "object") return null;
  if (!COUNTERS.every((key) => isCount(body[key]))) return null;
  if (body.keyGapCv !== null && !isCount(body.keyGapCv)) return null;
  if (typeof body.webdriver !== "boolean") return null;
  return {
    keys: body.keys,
    unkeyedChars: body.unkeyedChars,
    maxInsert: body.maxInsert,
    hiddenEdits: body.hiddenEdits,
    awayMs: body.awayMs,
    keyGapCv: body.keyGapCv,
    webdriver: body.webdriver,
  };
}

export type AiSubmission = {
  player: string;
  game: string;
  exerciseId: number;
  solution: string;
  correct: boolean;
  submittedAt: Date;
  telemetry: Telemetry | null;
  secFetchSite: string | null;
  userAgent: string | null;
};

export type AiStart = { player: string; game: string; exerciseId: number; firstStart: Date };

type Client = "browser" | "script" | "unknown";

// Browsers stamp Sec-Fetch-* on every fetch and page JS cannot suppress them, so their absence is
// the anchor, not the spoofable User-Agent. A null User-Agent means the submit predates the logging.
const classify = (s: AiSubmission): Client =>
  s.userAgent === null ? "unknown" : s.secFetchSite ? "browser" : "script";

type AiTells = {
  script: boolean;
  missingTelemetry: boolean;
  webdriver: boolean;
  unkeyed: boolean;
  hidden: boolean;
  tooQuick: boolean;
  away: boolean;
  robotic: boolean;
};

type AiExercise = {
  game: string;
  exerciseId: number;
  solveSeconds: number | null;
  charsPerSecond: number | null;
  unkeyedPct: number | null;
  awayMs: number | null;
  keyGapCv: number | null;
  client: Client;
};

export type AiSignals = {
  player: string;
  attempts: number;
  correct: number;
  tells: AiTells;
  nonBrowserUas: string[];
  exercises: AiExercise[];
  score: number;
};

const exerciseKey = (s: { player: string; game: string; exerciseId: number }) =>
  `${s.player}\n${s.game}\n${s.exerciseId}`;

const isUnkeyed = (s: AiSubmission) =>
  s.correct && !!s.telemetry && s.solution.length > 0 && s.telemetry.unkeyedChars >= UNKEYED_RATIO * s.solution.length;

const isRobotic = (t: Telemetry | null) =>
  !!t && t.keys >= MIN_KEYS_FOR_CADENCE && t.keyGapCv !== null && t.keyGapCv < ROBOTIC_CV;

function exerciseSignals(s: AiSubmission, firstStart: Date | undefined): AiExercise {
  const solveSeconds = firstStart ? (s.submittedAt.getTime() - firstStart.getTime()) / 1000 : null;
  return {
    game: s.game,
    exerciseId: s.exerciseId,
    solveSeconds,
    charsPerSecond: solveSeconds ? s.solution.length / solveSeconds : null,
    unkeyedPct:
      s.telemetry && s.solution.length ? Math.round((s.telemetry.unkeyedChars / s.solution.length) * 100) : null,
    awayMs: s.telemetry?.awayMs ?? null,
    keyGapCv: s.telemetry?.keyGapCv ?? null,
    client: classify(s),
  };
}

const isTooQuick = (e: AiExercise) =>
  (e.solveSeconds !== null && e.solveSeconds < QUICK_SECONDS) ||
  (e.charsPerSecond !== null && e.charsPerSecond > MAX_HUMAN_CHARS_PER_SECOND);

const hasHardTell = (t: AiTells) => t.script || t.missingTelemetry || t.webdriver || t.unkeyed || t.hidden;

function playerSignals(player: string, submissions: AiSubmission[], firstStarts: Map<string, Date>): AiSignals {
  const sorted = [...submissions].sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
  const firstCorrect = new Map<string, AiSubmission>();
  for (const s of sorted) {
    if (s.correct && !firstCorrect.has(exerciseKey(s))) firstCorrect.set(exerciseKey(s), s);
  }
  const exercises = [...firstCorrect.entries()].map(([key, s]) => exerciseSignals(s, firstStarts.get(key)));
  const scripts = sorted.filter((s) => classify(s) === "script");

  const tells: AiTells = {
    script: scripts.length > 0,
    missingTelemetry: sorted.some((s) => s.correct && classify(s) !== "unknown" && !s.telemetry),
    webdriver: sorted.some((s) => s.telemetry?.webdriver === true),
    unkeyed: sorted.some(isUnkeyed),
    hidden: sorted.some((s) => (s.telemetry?.hiddenEdits ?? 0) > 0),
    tooQuick: exercises.some(isTooQuick),
    away: [...firstCorrect.values()].some((s) => (s.telemetry?.awayMs ?? 0) >= AWAY_MS),
    robotic: [...firstCorrect.values()].some((s) => isRobotic(s.telemetry)),
  };
  const soft = [tells.tooQuick, tells.away, tells.robotic].filter(Boolean).length;

  return {
    player,
    attempts: sorted.length,
    correct: sorted.filter((s) => s.correct).length,
    tells,
    nonBrowserUas: [...new Set(scripts.map((s) => s.userAgent ?? ""))].filter(Boolean),
    exercises,
    score: (hasHardTell(tells) ? 70 : 0) + soft * 10,
  };
}

/** Players with at least one hard tell; speed, time away and cadence only rank. */
export function aiSuspects(submissions: AiSubmission[], starts: AiStart[]): AiSignals[] {
  const firstStarts = new Map<string, Date>();
  for (const s of starts) {
    const key = exerciseKey(s);
    const known = firstStarts.get(key);
    if (!known || s.firstStart < known) firstStarts.set(key, s.firstStart);
  }

  const byPlayer = new Map<string, AiSubmission[]>();
  for (const s of submissions) byPlayer.set(s.player, [...(byPlayer.get(s.player) ?? []), s]);

  return [...byPlayer.entries()]
    .map(([player, list]) => playerSignals(player, list, firstStarts))
    .filter((s) => hasHardTell(s.tells))
    .sort((a, b) => b.score - a.score || b.correct - a.correct);
}
