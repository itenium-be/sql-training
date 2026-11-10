import { DatabaseIcon } from '../layout/Icons';

export type BeamerView = 'players' | 'exercises' | 'you';

export function BeamerHeader({view, onSwitch, bare = false, showYou = false}: {view: BeamerView; onSwitch: (view: BeamerView) => void; bare?: boolean; showYou?: boolean}) {
  return (
    <header className={bare ? 'bm-head bm-head-bare' : 'bm-head'}>
      {!bare && (
        <>
          <span className="bm-head-mark"><DatabaseIcon size={48} /></span>
          <div>
            <div className="bm-eyebrow">DevFest Paris 2026 · Live</div>
            <div className="bm-title">SQL Showdown</div>
          </div>
        </>
      )}
      <div className="bm-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'players'} onClick={() => onSwitch('players')}>Players</button>
        <button type="button" role="tab" aria-selected={view === 'exercises'} onClick={() => onSwitch('exercises')}>Exercises</button>
        {showYou && <button type="button" role="tab" aria-selected={view === 'you'} onClick={() => onSwitch('you')}>You</button>}
      </div>
    </header>
  );
}
