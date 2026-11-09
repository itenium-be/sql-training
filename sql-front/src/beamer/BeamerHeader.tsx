import { DatabaseIcon } from '../layout/Icons';
import { ExerciseId, ExerciseModel } from '../exercises/exerciseModels';

export type BeamerView = 'players' | 'exercises';

type Props = {
  view: BeamerView;
  onSwitch: (view: BeamerView) => void;
  bare?: boolean;
  entities?: ExerciseModel[];
  game?: ExerciseId;
  onGame?: (game: ExerciseId) => void;
};

export function BeamerHeader({view, onSwitch, bare = false, entities = [], game, onGame}: Props) {
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
      <div className="bm-head-right">
        {view === 'exercises' && onGame && (
          <div className="bm-games" role="group" aria-label="Game">
            {entities.map(g => (
              <button key={g.id} type="button" className="bm-game" aria-pressed={g.id === game} onClick={() => onGame(g.id)}>{g.id}</button>
            ))}
          </div>
        )}
        <div className="bm-toggle" role="tablist">
          <button type="button" role="tab" aria-selected={view === 'players'} onClick={() => onSwitch('players')}>Players</button>
          <button type="button" role="tab" aria-selected={view === 'exercises'} onClick={() => onSwitch('exercises')}>Exercises</button>
        </div>
      </div>
    </header>
  );
}
