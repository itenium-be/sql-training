import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { AwardKey, awardDefinitions, calculateAward, scoringWeights } from "./scoring";
import { ExerciseSolution, ScoreBadge } from "./ExerciseSolution";

/** Per exercise "best of the room" table: fastest, most efficient or leanest. */
export function AwardTable({scores, award}: {scores: Score[], award: AwardKey}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);
  const definition = awardDefinitions[award];
  const rows = calculateAward(exercises, scores, award);

  if (!rows.length) {
    return (
      <>
        <h2>{definition.title}</h2>
        <p className="text-muted">{definition.description}</p>
        <p>Nothing to show yet.</p>
      </>
    )
  }

  return (
    <>
      <h2>
        {definition.title}
        <ScoreBadge points={scoringWeights[award]} />
      </h2>
      <p className="text-muted">{definition.description}</p>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Game</th>
            <th>Exercise</th>
            <th>Player</th>
            <th style={{width: 120}}>{definition.column}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.game + '-' + row.exerciseId}
              className={row.winners.includes(registeredName) ? 'table-primary' : undefined}
            >
              <td>
                <ExerciseSolution exerciseId={row.game + '-' + row.exerciseId} solution={row.solution} />
                <br /><ScoreBadge points={row.points} />
              </td>
              <td>{row.exercise}</td>
              <td>{row.winners.join(', ')}</td>
              <td>
                {definition.render(row.best)}
                {row.contenders > 1 && row.best !== row.average && (
                  <><br /><small className="text-muted">Avg: {definition.render(row.average)}</small></>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
