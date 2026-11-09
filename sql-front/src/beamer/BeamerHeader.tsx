import { DatabaseIcon } from '../layout/Icons';

export type BeamerView = 'players' | 'exercises';

export function BeamerHeader({view, onSwitch}: {view: BeamerView; onSwitch: (view: BeamerView) => void}) {
  return (
    <header className="bm-head">
      <span className="bm-head-mark"><DatabaseIcon size={48} /></span>
      <div>
        <div className="bm-eyebrow">DevFest Paris 2026 · Live</div>
        <div className="bm-title">SQL Showdown</div>
      </div>
      <div className="bm-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'players'} onClick={() => onSwitch('players')}>Players</button>
        <button type="button" role="tab" aria-selected={view === 'exercises'} onClick={() => onSwitch('exercises')}>Exercises</button>
      </div>
    </header>
  );
}
