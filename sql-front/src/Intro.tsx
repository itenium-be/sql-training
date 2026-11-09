import { Button } from "react-bootstrap";
import { ArrowIcon, BoltIcon, CalendarIcon, CheckIcon, DatabaseIcon, HexagonIcon, PlanIcon, ScissorsIcon } from "./layout/Icons";

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
      </p>

      <Stamps />

      <Button variant="primary" className="df-cta" onClick={onStart}>
        Let's start <ArrowIcon />
      </Button>

      <div className="df-footer">Brought to you by <strong>itenium</strong></div>
    </main>
  );
}

const STAMPS = [
  {label: 'CORRECT', sub: 'RIGHT ANSWER', color: '#a9c97a', rotate: -7, Icon: CheckIcon},
  {label: 'FASTEST', sub: 'FIRST TO SOLVE', color: '#e9b44c', rotate: 4, Icon: BoltIcon},
  {label: 'LEANEST', sub: 'FEWEST CHARS', color: '#d8862f', rotate: -3, Icon: ScissorsIcon},
  {label: 'BEST PLAN', sub: 'LOWEST COST', color: '#f0d28a', rotate: 6, Icon: PlanIcon},
];

function Stamps() {
  return (
    <div className="df-stamps">
      {STAMPS.map(({label, sub, color, rotate, Icon}) => (
        <div key={label} className="df-stamp" style={{color, transform: `rotate(${rotate}deg)`}}>
          <Icon />
          <b>{label}</b>
          <small>{sub}</small>
        </div>
      ))}
    </div>
  );
}
