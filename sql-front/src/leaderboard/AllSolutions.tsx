import { Accordion, Badge, Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { Score } from "../exercises/exerciseModels";
import { ScoreBadge } from "./ExerciseSolution";

export function AllSolutions({scores}: {scores: Score[]}) {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const exercises = useAppSelector(state => state.exercises.entities);

  const perExercise = exercises.flatMap(game => game.exercises.map(ex => ({
    key: `${game.id}-${ex.id}`,
    desc: ex.desc,
    points: ex.points,
    scores: scores
      .filter(score => score.game === game.id && score.exerciseid === ex.id && score.solution)
      .sort((a, b) => a.elapsed - b.elapsed),
  }))).filter(ex => ex.scores.length);

  if (!perExercise.length) {
    return null;
  }

  return (
    <>
      <h2>All Solutions</h2>
      <Accordion alwaysOpen>
        {perExercise.map(ex => (
          <Accordion.Item key={ex.key} eventKey={ex.key}>
            <Accordion.Header>
              <span style={{marginRight: 12}}>{ex.key}</span>
              <ScoreBadge points={ex.points} />
              <span style={{marginLeft: 12}}>{ex.desc}</span>
              <Badge bg="info" style={{marginLeft: 12}}>{ex.scores.length}</Badge>
            </Accordion.Header>
            <Accordion.Body>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th style={{width: 180}}>Player</th>
                    <th>SQL</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.scores.map(score => (
                    <tr key={score.player} className={score.player === registeredName ? 'table-primary' : undefined}>
                      <td>{score.player}</td>
                      <td><pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>{score.solution}</pre></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}
