import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score, SqlExerciseModel } from "../exercises/exerciseModels";
import { formatSeconds } from "../leaderboard/formatSeconds";

export function YourScores({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);

  const fullGame = new Map<string, SqlExerciseModel>();
  exercises.forEach(game => {
    game.exercises.forEach(exercise => fullGame.set(`${game.id}-${exercise.id}`, exercise));
  })

  const yourScores = scores
    .filter(score => score.player === registeredName)
    .sort((a, b) => `${a.game}-${a.exerciseid}`.localeCompare(`${b.game}-${b.exerciseid}`))

  if (!yourScores.length) {
    return <p>You have not solved anything yet. Pick a tab and get going!</p>
  }

  return (
    <Table bordered striped>
      <thead>
        <tr>
          <th>Game</th>
          <th>Exercise</th>
          <th>Points</th>
          <th>Time</th>
          <th>Attempts</th>
          <th>Hints</th>
          <th>Reads</th>
        </tr>
      </thead>
      <tbody>
        {yourScores.map(yourScore => {
          const key = `${yourScore.game}-${yourScore.exerciseid}`;
          const exercise = fullGame.get(key);
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{exercise?.desc ?? <i>unknown exercise</i>}</td>
              <td>{exercise?.points ?? 0}</td>
              <td>{formatSeconds(yourScore.elapsed)}</td>
              <td>{yourScore.attempts}</td>
              <td>{yourScore.hintsused ? 'yes' : 'no'}</td>
              <td>{yourScore.reads ? yourScore.reads.toLocaleString('nl-BE') : '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  )
}
