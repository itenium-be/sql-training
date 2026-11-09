import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score, SqlExerciseModel } from "../exercises/exerciseModels";
import { formatSeconds } from "../leaderboard/formatSeconds";

export function YourScores({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);

  const fullGame: Record<string, SqlExerciseModel> = {};
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
          <th>Hint</th>
          <th>Expected</th>
          <th>Wrong Attempts</th>
          <th>Time</th>
          <th>Reads</th>
        </tr>
      </thead>
      <tbody>
        {yourScores.map(yourScore => (
          <tr key={yourScore.game + '-' + yourScore.exerciseid}>
            <td>{yourScore.game}-{yourScore.exerciseid}</td>
            <td>{fullGame[yourScore.game + '-' + yourScore.exerciseid].desc}</td>
            <td>{yourScore.points ?? fullGame[yourScore.game + '-' + yourScore.exerciseid].points} / {fullGame[yourScore.game + '-' + yourScore.exerciseid].points}</td>
            <td>{yourScore.hint ? 'Yes' : '-'}</td>
            <td>{yourScore.expected ? 'Yes' : '-'}</td>
            <td>{yourScore.attempts}</td>
            <td>{formatSeconds(yourScore.elapsed)}</td>
            <td>{yourScore.cost ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
