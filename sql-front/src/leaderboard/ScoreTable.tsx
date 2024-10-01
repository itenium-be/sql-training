import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { calculateFastest } from "./FastestScores";
import { calculateShortest } from "./ShortestSolutions";

export function ScoreTable({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const exercisesPoints: any = {};
  exercises.forEach(game => {
    game.exercises.forEach(exercise => {
      exercisesPoints[`${game.id}-${exercise.id}`] = exercise.points;
    })
  })
  // console.log('exercisesPoints', exercisesPoints);

  const playerScores: Record<string, number> = {};
  scores.forEach(score => {
    if (!playerScores[score.player]) {
      playerScores[score.player] = 0;
    }
    const points = exercisesPoints[`${score.game}-${score.exerciseid}`];
    playerScores[score.player] += points || 0;
  });

  const fastestTable = calculateFastest(exercises, scores);
  const leanestTable = calculateShortest(exercises, scores);

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Points</th>
          <th># Fastest</th>
          <th># Shortest</th>
          <th>Total Score</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(playerScores).sort((a, b) => b[1] - a[1]).map(([player, score], index) => {
          const fastest = fastestTable.filter(fast => fast.player === player).length;
          const shortest = leanestTable.filter(fast => fast.player === player).length;
          return (
            <tr key={player} className={player === registeredName ? 'table-primary' : undefined}>
              <td>{index + 1}</td>
              <td>{player}</td>
              <td>{score}</td>
              <td>{fastest}</td>
              <td>{shortest}</td>
              <td><b>{score + fastest * 2 + shortest * 2}</b></td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  )
}
