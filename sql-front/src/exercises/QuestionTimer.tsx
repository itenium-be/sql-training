import { useEffect, useState } from 'react';
import { formatElapsed } from './formatElapsed';

export function QuestionTimer() {
  const [start] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <span className="df-timer" title="Time spent on this question">
      ⚡ {formatElapsed(seconds)}
    </span>
  );
}
