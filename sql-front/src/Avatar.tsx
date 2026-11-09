import { useState } from 'react';
import { avatarUrl } from './avatars';

export function Avatar({index, label, size = 96}: {index: number, label: string, size?: number}) {
  const [failed, setFailed] = useState(false);
  const style = {width: size, height: size};

  if (failed) {
    return (
      <span className="df-avatar df-avatar-fallback" style={{...style, fontSize: size * 0.4}}>
        {label.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className="df-avatar"
      style={style}
      src={avatarUrl(index)}
      alt={label}
      onError={() => setFailed(true)}
    />
  );
}
