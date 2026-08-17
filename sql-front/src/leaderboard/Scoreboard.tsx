import { useAppSelector } from "../store";
import { ScoreTable } from "./ScoreTable";
import { YourScores } from "./YourScores";
import { AwardTable } from "./AwardTable";

export function Scoreboard() {
  const scores = useAppSelector(state => state.exercises.scores);

  if (!scores.length) {
    return (
      <>
        <h1>Leaderboard</h1>
        <p>Be the first to score points!</p>
      </>
    );
  }

  return (
    <>
      <h1>Leaderboard</h1>
      <ScoreTable scores={scores} />

      <h2>Your Scores</h2>
      <YourScores scores={scores} />

      <AwardTable scores={scores} award="fastest" />
      <AwardTable scores={scores} award="efficient" />
      <AwardTable scores={scores} award="leanest" />
    </>
  )
}
