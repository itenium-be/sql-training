import { useEffect, useState } from 'react';
import { formatElapsed } from './formatElapsed';
import { secondsSince } from './questionElapsed';

export function QuestionTimer({ origin }: { origin: number }) {
  const [seconds, setSeconds] = useState(() => secondsSince(origin, Date.now()));

  useEffect(() => {
    const tick = () => setSeconds(secondsSince(origin, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [origin]);

  return (
    <span className="df-timer" title="Time spent on this question">
      <span className="df-timer-bolt">⚡</span> {formatElapsed(seconds)}
    </span>
  );
}
