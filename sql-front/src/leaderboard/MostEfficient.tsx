import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { ExerciseModel, Score } from "../exercises/exerciseModels";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

type EfficientExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  player: string;
  solution?: string;
  cost: number;
  avgCost: number;
}

export function calculateEfficient(exercises: ExerciseModel[], scores: Score[]) {
  const efficientTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => ({
      game: game.id,
      exerciseId: ex.id,
      exercise: ex.desc,
      points: ex.points,
      player: '',
      solution: undefined,
      cost: 0,
      avgCost: 0,
    }));
    return cur.concat(gameExs);
  }, [] as EfficientExercise[]);

  efficientTable.forEach(efficient => {
    const exScores = scores
      .filter(score => score.game === efficient.game && score.exerciseid === efficient.exerciseId && score.cost !== null)
      .sort((a, b) => a.cost! - b.cost! || a.solutionlength - b.solutionlength);

    if (!exScores.length) {
      return;
    }

    const [best, second] = exScores;
    if (second && second.cost === best.cost && second.solutionlength === best.solutionlength) {
      return;
    }

    efficient.player = best.player;
    efficient.cost = best.cost!;
    efficient.avgCost = Math.floor(exScores.reduce((acc, value) => acc + value.cost!, 0) / exScores.length);
    efficient.solution = best.solution;
  });

  return efficientTable;
}

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
