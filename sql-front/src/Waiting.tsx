import { useState } from 'react';
import { avatarIndex, Player, usePlayers } from './game';
import { AvatarPicker } from './AvatarPicker';
import { Avatar } from './Avatar';
import { PencilIcon } from './layout/Icons';
import { useAppSelector } from './store';

export function Waiting() {
  const [players, reload] = usePlayers();
  const registeredName = useAppSelector(state => state.exercises.userName);
  const me = registeredName.toLowerCase();
  const [editing, setEditing] = useState<Player | null>(null);

  return (
    <main className="df-intro">
      <div className="df-intro-deco" style={{ top: '10%', left: '8%' }}>
        <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true">
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
        </svg>
      </div>

      <div className="df-eyebrow">The arena is filling up</div>
      <h1 className="df-title df-regscreen-title">
        You're in, <span className="df-gradient-gold">{registeredName}</span>!
      </h1>
      <p className="df-lead">Waiting for the game to start…</p>

      <section className="df-lobby">
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
      </section>

      {editing && (
        <AvatarPicker
          current={avatarIndex(editing)}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </main>
  );
}
