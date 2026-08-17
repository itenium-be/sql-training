import { OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { calculateTotals, scoringWeights } from "./scoring";

function Header({label, title}: {label: string, title: string}) {
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip>{title}</Tooltip>}>
      <th style={{cursor: 'help'}}>{label}</th>
    </OverlayTrigger>
  )
}

export function ScoreTable({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const totalScores = calculateTotals(exercises, scores);

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <Header label="Points" title="For solving exercises" />
          <Header label="⚡ Fastest" title={`Exercises solved quickest of anyone (${scoringWeights.fastest} points each)`} />
          <Header label="🪶 Efficient" title={`Exercises where your query read the fewest blocks (${scoringWeights.efficient} points each)`} />
          <Header label="✂️ Leanest" title={`Exercises with the shortest SQL (${scoringWeights.leanest} point each)`} />
          <Header label="🎯 First Try" title={`Solved on the first Submit (${scoringWeights.firstTry} point each)`} />
          <Header label="🙈 No Hints" title={`Solved without revealing the expected result (${scoringWeights.noHints} point each)`} />
          <Header label="Bonus" title="All of the above added up" />
          <th>Total Score</th>
        </tr>
      </thead>
      <tbody>
        {totalScores.map((player, index) => (
          <tr key={player.name} className={player.name === registeredName ? 'table-primary' : undefined}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.points}</td>
            <td>{player.fastest}</td>
            <td>{player.efficient}</td>
            <td>{player.leanest}</td>
            <td>{player.firstTry}</td>
            <td>{player.noHints}</td>
            <td>{player.bonus}</td>
            <td><b>{player.total}</b></td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
