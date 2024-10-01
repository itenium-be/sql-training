import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { ExerciseModel, Score } from "../exercises/exerciseModels";
import { formatSeconds } from "./formatSeconds";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

type FastestExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  player: string;
  solution?: string;
  time: number;
}

export function calculateFastest(exercises: ExerciseModel[], scores: Score[]) {
  const fastestTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => {
      return {
        game: game.id,
        exerciseId: ex.id,
        exercise: ex.desc,
        points: ex.points,
        player: '',
        solution: undefined,
        time: 0,
      }
    })
    return cur.concat(gameExs);
  }, [] as FastestExercise[]);
  // console.log('fastest', fastestTable);
  // console.log('scores', scores);

  fastestTable.forEach(fastest => {
    const exScores = scores
      .filter(score => score.game === fastest.game && score.exerciseid === fastest.exerciseId)
      .sort((a, b) => b.elapsed - a.elapsed);

    if (exScores.length) {
      fastest.player = exScores[0].player;
      fastest.time = exScores[0].elapsed;
      fastest.solution = exScores[0].solution;
    }
  })

  return fastestTable;
}

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
