import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { formatSeconds } from "../leaderboard/formatSeconds";

export function YourScores({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);

  const fullGame: any = {};
  exercises.forEach(game => {
    game.exercises.forEach(exercise => {
      fullGame[`${game.id}-${exercise.id}`] = exercise;
    })
  })

  const yourScores = scores
    .filter(score => score.player === registeredName)
    .sort((a, b) => `${a.game}-${a.exerciseid}`.localeCompare(`${b.game}-${b.exerciseid}`))

  return (
    <Table bordered striped>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Points</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {yourScores.map(yourScore => (
          <tr key={yourScore.game + '-' + yourScore.exerciseid}>
            <td>{yourScore.game}-{yourScore.exerciseid}</td>
            <td>{fullGame[yourScore.game + '-' + yourScore.exerciseid].desc}</td>
            <td>{fullGame[yourScore.game + '-' + yourScore.exerciseid].points}</td>
            <td>{formatSeconds(yourScore.elapsed)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
