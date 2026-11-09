import { useAppSelector } from "../store";
import { ScoreTable } from "./ScoreTable";
import { YourScores } from "./YourScores";
import { FastestScorers } from "./FastestScores";
import { ShortestSolutions } from "./ShortestSolutions";
import { MostEfficient } from "./MostEfficient";

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

      <h2>Fastest Scorers</h2>
      <FastestScorers scores={scores} />

      <h2>Your Scores</h2>
      <YourScores scores={scores} />

      <h2>Leanest Solutions</h2>
      <ShortestSolutions scores={scores} />

      <h2>Most Efficient Queries</h2>
      <MostEfficient scores={scores} />
    </>
  )
}
