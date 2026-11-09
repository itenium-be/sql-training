import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { calculateFastest } from "./scoreCalculations";
import { formatSeconds } from "./formatSeconds";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

export function FastestScorers({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const fastestTable = calculateFastest(exercises, scores);

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Player</th>
          <th style={{width: 90}}>Time</th>
        </tr>
      </thead>
      <tbody>
        {fastestTable.filter(fast => !!fast.player).map(fast => (
          <tr key={fast.game + '-' + fast.exerciseId} className={fast.player === registeredName ? 'table-primary' : undefined}>
            <td>
              <ExerciseSolution exerciseId={fast.game+'-'+fast.exerciseId} solution={fast.solution} />
              <br /><ScoreBadge points={fast.points} />
            </td>
            <td>{fast.exercise}</td>
            <td>{fast.player}</td>
            <td>{formatSeconds(fast.time)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
