import { Button } from "react-bootstrap";
import { ArrowIcon, CalendarIcon, DatabaseIcon, HexagonIcon } from "./layout/Icons";

export function Intro({onStart}: {onStart: () => void}) {
  return (
    <main className="df-intro">
      <div className="df-intro-deco" style={{top: '8%', left: '6%'}}><DatabaseIcon size={120} /></div>
      <div className="df-intro-deco" style={{top: '30%', right: '8%'}}><HexagonIcon size={220} /></div>
      <div className="df-intro-deco" style={{bottom: '10%', left: '12%'}}><HexagonIcon size={140} /></div>

      <div className="df-pill df-eyebrow">
        <CalendarIcon size={18} />
        <span>27 November 2026 · La Fabrique de la Connaissance</span>
      </div>

      <h1 className="df-title">
        <span className="df-title-plain">SQL Showdown</span>
        <span className="df-gradient-gold">DevFest Paris</span>
        <span className="df-gradient-copper">Edition.</span>
      </h1>

      <p className="df-lead">
        Live SQL challenges on Postgres &amp; SQL Server.
        Solve fastest, write the leanest query and climb the leaderboard.
      </p>

      <Button variant="primary" className="df-cta" onClick={onStart}>
        Let's start <ArrowIcon />
      </Button>

      <div className="df-footer">Brought to you by <strong>itenium</strong></div>
    </main>
  );
}
