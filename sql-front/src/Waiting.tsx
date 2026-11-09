import { useState } from 'react';
import { avatarIndex, Player, usePlayers } from './game';
import { MEME_COUNT, memeUrl, nextMeme } from './meme';
import { AvatarPicker } from './AvatarPicker';
import { Avatar } from './Avatar';
import { PencilIcon, ShuffleIcon } from './layout/Icons';
import { useAppSelector } from './store';

export function Waiting() {
  const [players, reload] = usePlayers();
  const registeredName = useAppSelector(state => state.exercises.userName);
  const me = registeredName.toLowerCase();
  const [editing, setEditing] = useState<Player | null>(null);
  const [meme, setMeme] = useState(() => Math.floor(Math.random() * MEME_COUNT) + 1);

  return (
    <main className="df-intro df-waitscreen">
      <div className="df-intro-deco" style={{ top: '10%', left: '6%' }}>
        <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true">
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
        </svg>
      </div>

      <div className="df-waitgrid">
        <div className="df-wait-left">
          <div className="df-eyebrow">The arena is filling up</div>
          <h1 className="df-title df-wait-title">
            You're in,{' '}
            <span className="df-gradient-gold" style={{ whiteSpace: 'nowrap' }}>{registeredName}!</span>
          </h1>
          <p className="df-lead df-wait-status">
            <span className="df-wait-dot" aria-hidden="true" />
            Waiting for the game to start…
          </p>

          <div className="df-eyebrow df-wait-count">
            {players.length} {players.length === 1 ? 'player' : 'players'} in the arena
          </div>
          <div className="df-lobby-grid">
            {players.map(player => {
              const isMe = player.name.toLowerCase() === me;
              return (
                <div key={player.id} className={`df-lobby-player${isMe ? ' df-lobby-me' : ''}`}>
                  <div className="df-avatar-wrap">
                    <Avatar key={avatarIndex(player)} index={avatarIndex(player)} label={player.name} size={64} />
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
        </div>

        <div className="df-meme">
          <div className="df-meme-head">
            <span className="df-meme-label">while you wait…</span>
            <button type="button" className="df-meme-shuffle" onClick={() => setMeme(m => nextMeme(m))}>
              <ShuffleIcon /> Shuffle
            </button>
          </div>
          <img className="df-meme-img" src={memeUrl(meme)} alt="SQL meme" />
        </div>
      </div>

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
