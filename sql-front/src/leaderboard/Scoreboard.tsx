import { useState } from "react";
import { useAppSelector } from "../store";
import { ExerciseId } from "../exercises/exerciseModels";
import { formatSeconds } from "./formatSeconds";
import { exerciseAwards, PlayerRow, rankPlayers } from "./leaderboardData";
import { YourScores } from "./YourScores";
import { AllSolutions } from "./AllSolutions";

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function Scoreboard() {
  const scores = useAppSelector(state => state.exercises.scores);
  const exercises = useAppSelector(state => state.exercises.entities);
  const registeredName = useAppSelector(state => state.exercises.userName);
  const [rankGame, setRankGame] = useState<ExerciseId | null>(null);
  const [awardGame, setAwardGame] = useState<ExerciseId | null>(exercises[0]?.id ?? null);

  if (!scores.length) {
    return (
      <>
        <h1>Leaderboard</h1>
        <p>Be the first to score points!</p>
      </>
    );
  }

  const rows = rankPlayers(exercises, scores, rankGame ?? undefined);
  const overall = rankPlayers(exercises, scores);
  const youIndex = overall.findIndex(r => r.name === registeredName);
  const you = youIndex === -1 ? null : overall[youIndex];

  return (
    <>
      <h1>Leaderboard</h1>

      {you && <YourStanding you={you} rank={youIndex + 1} total={overall.length} />}

      <div className="lb-filters">
        <span className="df-eyebrow">Show</span>
        <FilterPill label="Overall" active={rankGame === null} onClick={() => setRankGame(null)} />
        {exercises.map(game => (
          <FilterPill key={game.id} label={game.name} active={rankGame === game.id} onClick={() => setRankGame(game.id)} />
        ))}
      </div>

      <RankingTable rows={rows} you={registeredName} />

      <div className="lb-awards-head">
        <h2 style={{margin: 0}}>Exercise awards</h2>
        <span className="lb-dim">your awards in gold</span>
        <div className="lb-awards-tabs">
          {exercises.map(game => (
            <FilterPill key={game.id} label={game.name} active={awardGame === game.id} onClick={() => setAwardGame(game.id)} />
          ))}
        </div>
      </div>
      {awardGame && <AwardsTable game={awardGame} you={registeredName} />}

      <h2>Your Scores</h2>
      <YourScores scores={scores} />

      <AllSolutions scores={scores} />
    </>
  );
}

function FilterPill({label, active, onClick}: {label: string; active: boolean; onClick: () => void}) {
  return (
    <button type="button" className={active ? 'lb-pill lb-pill-active' : 'lb-pill'} onClick={onClick}>
      {label}
    </button>
  );
}

function YourStanding({you, rank, total}: {you: PlayerRow; rank: number; total: number}) {
  return (
    <div className="lb-standing">
      <span className="lb-av lb-av-you">{initial(you.name)}</span>
      <div className="lb-standing-main">
        <div className="df-eyebrow">Your standing</div>
        <div className="lb-standing-rank">#{rank} of {total} · {you.total} pts</div>
      </div>
      <div className="lb-badges">
        <span className="lb-badge lb-badge-correct"><b>{you.solved}</b> correct</span>
        <span className="lb-badge"><b>{you.fastest}</b> fastest</span>
        <span className="lb-badge"><b>{you.shortest}</b> shortest</span>
        <span className="lb-badge"><b>{you.leanest}</b> leanest</span>
      </div>
    </div>
  );
}

function RankingTable({rows, you}: {rows: PlayerRow[]; you: string}) {
  return (
    <div className="lb-card lb-scroll">
      <table className="lb-table">
        <thead>
          <tr>
            <th>#</th><th>Player</th><th>Solved</th><th className="lb-num">Points</th>
            <th className="lb-num">Fastest</th><th className="lb-num">Shortest</th><th className="lb-num">Leanest</th><th className="lb-num">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.name} className={row.name === you ? 'lb-me' : undefined}>
              <td className="lb-rank">{index + 1}</td>
              <td><span className="lb-player"><span className="lb-av">{initial(row.name)}</span>{row.name}{row.name === you && <span className="lb-you">you</span>}</span></td>
              <td>
                <span className="lb-solved">
                  <span className="lb-bar"><span style={{width: `${row.totalExercises ? Math.round(row.solved / row.totalExercises * 100) : 0}%`}} /></span>
                  <span className="lb-ratio">{row.solved}/{row.totalExercises}</span>
                </span>
              </td>
              <td className="lb-num">{row.points}</td>
              <td className="lb-num">{row.fastest}</td>
              <td className="lb-num">{row.shortest}</td>
              <td className="lb-num">{row.leanest}</td>
              <td className="lb-num lb-total">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AwardsTable({game, you}: {game: ExerciseId; you: string}) {
  const scores = useAppSelector(state => state.exercises.scores);
  const exercises = useAppSelector(state => state.exercises.entities);
  const awards = exerciseAwards(exercises, scores, game);

  const holder = (name: string | undefined, value: string) => (
    <span className={name === you ? 'lb-aw lb-aw-mine' : 'lb-aw'}>
      {name ? <><span className="lb-aw-name">{name}</span><span className="lb-aw-val">{value}</span></> : <span className="lb-dim">—</span>}
    </span>
  );

  return (
    <div className="lb-card lb-scroll">
      <table className="lb-table">
        <thead>
          <tr><th>Exercise</th><th className="lb-num">Solved by</th><th>Fastest</th><th>Shortest</th><th>Leanest</th></tr>
        </thead>
        <tbody>
          {awards.map(award => (
            <tr key={award.exerciseId}>
              <td className="lb-exname">#{award.exerciseId} · {award.desc}</td>
              <td className="lb-num lb-dim">{award.solvedBy}</td>
              <td>{holder(award.fastest?.player, award.fastest ? formatSeconds(award.fastest.time) : '')}</td>
              <td>{holder(award.shortest?.player, award.shortest ? `${award.shortest.chars} ch` : '')}</td>
              <td>{holder(award.leanest?.player, award.leanest ? `${award.leanest.reads} reads` : '')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
