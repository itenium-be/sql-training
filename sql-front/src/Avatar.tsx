import { useState } from 'react';
import { avatarUrl, Player } from './game';

export function Avatar({player, size = 96}: {player: Player, size?: number}) {
  const [failed, setFailed] = useState(false);
  const style = {width: size, height: size};

  if (failed) {
    return (
      <span className="df-avatar df-avatar-fallback" style={{...style, fontSize: size * 0.4}}>
        {player.name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className="df-avatar"
      style={style}
      src={avatarUrl(player.id)}
      alt={player.name}
      onError={() => setFailed(true)}
    />
  );
}
