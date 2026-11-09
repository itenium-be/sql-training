import { Alert } from 'react-bootstrap';
import { useRegister } from './useRegister';

export function Register() {
  const { name, setName, response, register } = useRegister();
  const trimmed = name.trim();

  return (
    <main className="df-intro df-regscreen">
      <div className="df-intro-deco" style={{ top: '14%', right: '9%' }}>
        <svg width={150} height={150} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true">
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
        </svg>
      </div>

      <div className="df-eyebrow">Join the showdown</div>
      <h1 className="df-title df-regscreen-title">
        <span className="df-title-plain">Claim </span>
        <span className="df-gradient-gold">your row</span>
      </h1>

      <div className="df-sqlcard">
        <div className="df-sqlcard-head">
          <span className="df-sqlcard-dot" style={{ background: '#b2472a' }} />
          <span className="df-sqlcard-dot" style={{ background: '#e9b44c' }} />
          <span className="df-sqlcard-dot" style={{ background: '#a9c97a' }} />
          <span className="df-sqlcard-file">register.sql</span>
        </div>

        <div className="df-sqlcard-code">
          <span className="df-sqlcard-ln">1</span>
          <span><span className="df-sql-kw">INSERT INTO</span> players (name)</span>
          <span className="df-sqlcard-ln">2</span>
          <span>
            <span className="df-sql-kw">VALUES</span> (
            <span className="df-sql-str">
              '
              <input
                className="df-sql-input"
                value={name}
                size={Math.max(trimmed.length || 9, 9)}
                placeholder="your name"
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') register(); }}
                autoFocus
                aria-label="Your name"
              />
              '
            </span>
            );
          </span>
        </div>

        <div className="df-sqlcard-foot">
          <button type="button" className="btn btn-primary df-sqlcard-run" onClick={register} disabled={!trimmed}>
            Run
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </button>
        </div>
      </div>

      {response && <Alert variant="info" className="df-regscreen-alert">{response}</Alert>}
    </main>
  );
}
