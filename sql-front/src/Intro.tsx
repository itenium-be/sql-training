import { Button } from "react-bootstrap";
import { ArrowIcon, CalendarIcon, DatabaseIcon, HexagonIcon } from "./layout/Icons";
import { GameMode, usePlayers } from "./game";
import { RegisterForm } from "./RegisterForm";
import { Avatar } from "./Avatar";
import { useAppSelector } from "./store";

export function Intro({mode, onStart}: {mode: GameMode | null, onStart: () => void}) {
  return (
    <main className="df-intro">
      <div className="df-intro-deco" style={{top: '8%', left: '6%'}}><DatabaseIcon size={120} /></div>
      <div className="df-intro-deco" style={{top: '30%', right: '8%'}}><HexagonIcon size={220} /></div>
      <div className="df-intro-deco" style={{bottom: '10%', left: '12%'}}><HexagonIcon size={140} /></div>

      <div className="df-pill df-eyebrow">
        <CalendarIcon size={18} />
        <span>27 November 2026 · La Fabrique de la Connaissance</span>
      </div>

      <h1 className="df-title">
        <span className="df-title-plain">SQL Showdown</span>
        <span className="df-gradient-gold">DevFest Paris</span>
        <span className="df-gradient-copper">Edition.</span>
      </h1>

      <p className="df-lead">
        Live SQL challenges on Postgres &amp; SQL Server.
        Solve fastest, write the leanest query and climb the leaderboard.
      </p>

      {mode === 'init' ? (
        <Lobby />
      ) : (
        <Button variant="primary" className="df-cta" onClick={onStart}>
          Let's start <ArrowIcon />
        </Button>
      )}

      <div className="df-footer">Brought to you by <strong>itenium</strong></div>
    </main>
  );
}

function Lobby() {
  const players = usePlayers();
  const registeredName = useAppSelector(state => state.exercises.userName);
  const me = registeredName.toLowerCase();

  return (
    <section className="df-lobby">
      {registeredName ? (
        <p className="df-lobby-status">You're in, <strong>{registeredName}</strong>! Waiting for the game to start...</p>
      ) : (
        <RegisterForm />
      )}

      <div className="df-eyebrow">{players.length} {players.length === 1 ? 'player' : 'players'} in the arena</div>
      <div className="df-lobby-grid">
        {players.map(player => (
          <div key={player.id} className={`df-lobby-player${player.name.toLowerCase() === me ? ' df-lobby-me' : ''}`}>
            <Avatar player={player} />
            <span className="df-lobby-name" title={player.name}>{player.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
