import { useEffect, useState } from "react";
import { Modal, Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { config, authFetch } from "../config";
import { Score } from "../exercises/exerciseModels";
import { MySolution } from "../exercises/Exercise";
import { formatClock } from "../beamer/beamerData";
import { ExerciseAward, exerciseAwards } from "./leaderboardData";
import { compareToLeader } from "./compareToLeader";
import { helpLabel } from "./helpLabel";

type Opened = { game: string; exerciseId: number; desc?: string };

const key = (game: string, exerciseId: number) => `${game}-${exerciseId}`;

function Metric({ value, format, formatGap = format, holder, you, award }: {
  value: number | null;
  format: (n: number) => string;
  formatGap?: (n: number) => string;
  holder: { player: string; value: number } | null;
  you: string;
  award: string;
}) {
  if (value === null) return <span className="ys-gap">—</span>;
  const cmp = compareToLeader(value, holder, you);
  return (
    <>
      <span className="ys-val">{format(value)}</span>
      {cmp.kind === 'best' && <span className="ys-best">{award}</span>}
      {cmp.kind === 'tied' && <span className="ys-gap">tied with {cmp.leader}</span>}
      {cmp.kind === 'behind' && <span className="ys-gap ys-behind">+{formatGap(cmp.gap)} vs {cmp.leader}</span>}
    </>
  );
}

export function YourScores({scores, you}: {scores: Score[]; you: string}) {
  const exercises = useAppSelector(state => state.exercises.entities);
  const [questions, setQuestions] = useState<Record<string, string | undefined>>({});
  const [open, setOpen] = useState<Score | null>(null);

  useEffect(() => {
    authFetch(`${config.api}/game/me`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setQuestions(Object.fromEntries((data.exercises as Opened[]).map(ex => [key(ex.game, ex.exerciseId), ex.desc])));
      })
      .catch(err => console.error('Could not fetch your exercises', err));
  }, []);

  const awards = new Map<string, ExerciseAward>();
  exercises.forEach(game => exerciseAwards(exercises, scores, game.id).forEach(a => awards.set(key(a.game, a.exerciseId), a)));
  const maxPoints = new Map<string, number>();
  exercises.forEach(game => game.exercises.forEach(ex => maxPoints.set(key(game.id, ex.id), ex.points)));

  const mine = scores
    .filter(score => score.player === you)
    .sort((a, b) => key(a.game, a.exerciseid).localeCompare(key(b.game, b.exerciseid)));

  return (
    <>
      <Table bordered striped hover className="ys-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Points</th>
            <th>Help</th>
            <th>⚡ Time</th>
            <th>&lt;/&gt; Chars</th>
            <th>🍃 Reads</th>
          </tr>
        </thead>
        <tbody>
          {mine.map(score => {
            const k = key(score.game, score.exerciseid);
            const award = awards.get(k);
            const max = maxPoints.get(k);
            return (
              <tr key={k} className="ys-row" onClick={() => setOpen(score)}>
                <td className="ys-id">{k}</td>
                <td className="ys-q">{questions[k] ?? ''}</td>
                <td className="ys-num">{score.points ?? max} / {max}</td>
                <td className="ys-gap">{helpLabel(score)}</td>
                <td><Metric value={score.elapsed} format={formatClock} you={you} award="fastest"
                  holder={award?.fastest ? { player: award.fastest.player, value: award.fastest.time } : null} /></td>
                <td><Metric value={score.solutionlength} format={n => `${n} ch`} formatGap={String} you={you} award="shortest"
                  holder={award?.shortest ? { player: award.shortest.player, value: award.shortest.chars } : null} /></td>
                <td><Metric value={score.cost} format={String} you={you} award="leanest"
                  holder={award?.leanest ? { player: award.leanest.player, value: award.leanest.reads } : null} /></td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {open && (
        <Modal show onHide={() => setOpen(null)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{key(open.game, open.exerciseid)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {questions[key(open.game, open.exerciseid)] && <p className="ys-modal-q">{questions[key(open.game, open.exerciseid)]}</p>}
            <MySolution game={open.game} exerciseId={open.exerciseid}
              points={open.points ?? maxPoints.get(key(open.game, open.exerciseid)) ?? 0}
              maxPoints={maxPoints.get(key(open.game, open.exerciseid)) ?? 0} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
