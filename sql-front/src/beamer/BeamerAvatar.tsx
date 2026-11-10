import { CSSProperties } from 'react';
import { Player, avatarIndex } from '../game';
import { avatarUrl } from '../avatars';

export type Ring = 'gold' | 'you' | 'border';

const ringStyle: Record<Ring, CSSProperties> = {
  gold: {borderColor: 'var(--df-gold)', boxShadow: '0 0 0 6px rgba(233,180,76,0.2), 0 0 60px rgba(233,180,76,0.25)'},
  you: {borderColor: 'var(--df-gold)', boxShadow: '0 0 0 5px rgba(233,180,76,0.2)'},
  border: {borderColor: 'var(--df-gold)'},
};

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function BeamerAvatar({name, players, size, ring}: {name: string; players: Player[]; size: number; ring?: Ring}) {
  const player = players.find(p => p.name.toLowerCase() === name.toLowerCase());
  const style = {width: size, height: size, fontSize: Math.round(size * 0.4), ...(ring ? ringStyle[ring] : {})};
  return (
    <span className="bm-av" style={style}>
      {player ? <img className="bm-av-photo" src={avatarUrl(avatarIndex(player))} alt={name} /> : initial(name)}
    </span>
  );
}
