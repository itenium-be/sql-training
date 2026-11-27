import { useEffect, useState } from "react";
import { authFetch, config } from "../config";
import { ExercisesData } from "./ExerciseSampleData";
import { formatScored } from "./formatScored";
import { SolutionCard } from "./SolutionCard";
import { Metric } from "./solutionCards";

type MySolutionModel = { solution: string; rows: Record<string, unknown>[] | null };

export function MySolution({game, exerciseId, points, maxPoints, metrics}: {game: string, exerciseId: number, points: number, maxPoints: number, metrics: Metric[]}) {
  const [data, setData] = useState<MySolutionModel | null>(null);

  useEffect(() => {
    authFetch(`${config.api}/game/solution?game=${encodeURIComponent(game)}&exerciseId=${exerciseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(setData)
      .catch(err => console.error('Could not fetch your solution', err));
  }, [game, exerciseId]);

  if (!data) return null;

  return (
    <SolutionCard
      mine
      label={<span className="df-soltag df-soltag-you">You</span>}
      extra={<span className="df-solcard-pts">{formatScored(points, maxPoints)}</span>}
      metrics={metrics}
      solution={data.solution}
    >
      {data.rows && <ExercisesData data={data.rows} />}
    </SolutionCard>
  );
}
