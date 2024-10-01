import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { ExerciseModel, Score } from "../exercises/exerciseModels";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

type LeanestExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  player: string;
  solution?: string;
  solutionLength: number;
  avgLength: number;
}

export function calculateShortest(exercises: ExerciseModel[], scores: Score[]) {
  const leanestTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => {
      return {
        game: game.id,
        exerciseId: ex.id,
        exercise: ex.desc,
        points: ex.points,
        player: '',
        solution: undefined,
        solutionLength: 0,
        avgLength: 0,
      }
    })
    return cur.concat(gameExs);
  }, [] as LeanestExercise[]);
  // console.log('fastest', leanestTable);
  // console.log('scores', scores);

  leanestTable.forEach(leanest => {
    const exScores = scores
      .filter(score => score.game === leanest.game && score.exerciseid === leanest.exerciseId)
      .sort((a, b) => a.solutionlength - b.solutionlength);

    if (exScores.length && (exScores.length === 1 || exScores[0].solutionlength !== exScores[1].solutionlength)) {
      leanest.player = exScores[0].player;
      leanest.solutionLength = exScores[0].solutionlength;
      leanest.avgLength = Math.floor(exScores.reduce((acc, value) => acc + value.solutionlength, 0) / exScores.length);
      leanest.solution = exScores[0].solution;
    }
  })

  return leanestTable;
}

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
              <ScoreBadge points={lean.points} />
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
