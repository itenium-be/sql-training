import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { calculateShortest } from "./scoreCalculations";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

export function ShortestSolutions({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const leanestTable = calculateShortest(exercises, scores);

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Player</th>
          <th>SQL Length</th>
        </tr>
      </thead>
      <tbody>
        {leanestTable.filter(lean => !!lean.player).map(lean => (
          <tr key={lean.game + '-' + lean.exerciseId} className={lean.player === registeredName ? 'table-primary' : undefined}>
            <td>
              <ExerciseSolution exerciseId={lean.game+'-'+lean.exerciseId} solution={lean.solution} />
              <br /><ScoreBadge points={lean.points} />
            </td>
            <td>{lean.exercise}</td>
            <td>{lean.player}</td>
            <td>
              {lean.solutionLength}
              {lean.solutionLength !== lean.avgLength && <><br />Avg: {lean.avgLength}</>}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
