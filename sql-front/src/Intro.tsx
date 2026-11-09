import { Button } from "react-bootstrap";
import { ArrowIcon, CalendarIcon, DatabaseIcon, HexagonIcon, PencilIcon } from "./layout/Icons";
import { avatarIndex, GameMode, Player, usePlayers } from "./game";
import { useState } from "react";
import { AvatarPicker } from "./AvatarPicker";
import { RegisterForm } from "./RegisterForm";
import { Avatar } from "./Avatar";
import { useAppSelector } from "./store";
import { event } from "./event";

export function Intro({mode, onStart}: {mode: GameMode | null, onStart: () => void}) {
  return (
    <main className="df-intro">
      <div className="df-intro-deco" style={{top: '8%', left: '6%'}}><DatabaseIcon size={120} /></div>
      <div className="df-intro-deco" style={{top: '30%', right: '8%'}}><HexagonIcon size={220} /></div>
      <div className="df-intro-deco" style={{bottom: '10%', left: '12%'}}><HexagonIcon size={140} /></div>

      <div className="df-pill df-eyebrow">
        <CalendarIcon size={18} />
        <span>{event.date} · {event.venue}</span>
      </div>

      <h1 className="df-title">
        <span className="df-title-plain">SQL Showdown</span>
        <span className="df-gradient-1">{event.name}</span>
        <span className="df-gradient-2">Edition.</span>
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
  const [players, reload] = usePlayers();
  const registeredName = useAppSelector(state => state.exercises.userName);
  const me = registeredName.toLowerCase();
  const [editing, setEditing] = useState<Player | null>(null);

  return (
    <section className="df-lobby">
      {registeredName ? (
        <p className="df-lobby-status">You're in, <strong>{registeredName}</strong>! Waiting for the game to start...</p>
      ) : (
        <RegisterForm />
      )}

      <div className="df-eyebrow">{players.length} {players.length === 1 ? 'player' : 'players'} in the arena</div>
      <div className="df-lobby-grid">
        {players.map(player => {
          const isMe = player.name.toLowerCase() === me;
          return (
            <div key={player.id} className={`df-lobby-player${isMe ? ' df-lobby-me' : ''}`}>
              <div className="df-avatar-wrap">
                <Avatar key={avatarIndex(player)} index={avatarIndex(player)} label={player.name} />
                {isMe && (
                  <button type="button" className="df-avatar-edit" onClick={() => setEditing(player)} aria-label="Change avatar">
                    <PencilIcon />
                  </button>
                )}
              </div>
              <span className="df-lobby-name" title={player.name}>{player.name}</span>
            </div>
          );
        })}
      </div>

      {editing && (
        <AvatarPicker
          current={avatarIndex(editing)}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </section>
  );
}
