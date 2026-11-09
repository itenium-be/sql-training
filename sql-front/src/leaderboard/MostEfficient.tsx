import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { calculateEfficient } from "./scoreCalculations";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

export function MostEfficient({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const efficientTable = calculateEfficient(exercises, scores);

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Player</th>
          <th title="Logical page reads, ties broken by SQL length">Reads</th>
        </tr>
      </thead>
      <tbody>
        {efficientTable.filter(eff => !!eff.player).map(eff => (
          <tr key={eff.game + '-' + eff.exerciseId} className={eff.player === registeredName ? 'table-primary' : undefined}>
            <td>
              <ExerciseSolution exerciseId={eff.game+'-'+eff.exerciseId} solution={eff.solution} />
              <br /><ScoreBadge points={eff.points} />
            </td>
            <td>{eff.exercise}</td>
            <td>{eff.player}</td>
            <td>
              {eff.cost}
              {eff.cost !== eff.avgCost && <><br />Avg: {eff.avgCost}</>}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
