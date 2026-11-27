import { ReactNode, useEffect, useState } from "react";
import { authFetch, config } from "../config";
import { CopyButton } from "../layout/CopyButton";
import { ExercisesData } from "./ExerciseSampleData";
import { formatElapsed } from "./formatElapsed";
import { formatScored } from "./formatScored";

type MySolutionModel = { solution: string; elapsed: number; rows: Record<string, unknown>[] | null };

export function MySolution({game, exerciseId, points, maxPoints, tags}: {game: string, exerciseId: number, points: number, maxPoints: number, tags?: ReactNode}) {
  const [data, setData] = useState<MySolutionModel | null>(null);

  useEffect(() => {
    authFetch(`${config.api}/game/solution?game=${encodeURIComponent(game)}&exerciseId=${exerciseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(setData)
      .catch(err => console.error('Could not fetch your solution', err));
  }, [game, exerciseId]);

  if (!data) return null;

  return (
    <>
      <div className="df-eyebrow">Your query · <span className="df-timer"><span className="df-timer-bolt">⚡</span> {formatElapsed(data.elapsed)}</span> <span className="df-timer">{formatScored(points, maxPoints)}</span> {tags} <CopyButton text={data.solution} /></div>
      <pre className="df-sample-query">{data.solution}</pre>
      {data.rows && <ExercisesData data={data.rows} />}
    </>
  );
}
