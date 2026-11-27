import { ReactNode } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CopyButton } from '../layout/CopyButton';
import { BoltIcon, CodeIcon, LeafIcon } from '../layout/Icons';
import { SolutionTag } from '../beamer/beamerData';
import { Metric } from './solutionCards';

const ICONS: Record<SolutionTag, ReactNode> = {
  fastest: <BoltIcon size={13} />,
  shortest: <CodeIcon size={13} />,
  leanest: <LeafIcon size={13} />,
};

export function SolutionCard({label, extra, metrics, solution, mine, children}: {label: ReactNode, extra?: ReactNode, metrics: Metric[], solution: string, mine?: boolean, children?: ReactNode}) {
  return (
    <section className={mine ? 'df-solcard df-solcard-mine' : 'df-solcard'}>
      <div className="df-solcard-head">
        {label}
        {extra}
        <span className="df-solcard-spacer" />
        {metrics.map(m => (
          <OverlayTrigger key={m.kind} placement="top" overlay={<Tooltip>{m.tip}</Tooltip>}>
            <span className={m.won ? `df-metric df-metric-won df-metric-${m.kind}` : 'df-metric'} tabIndex={0}>
              {ICONS[m.kind]}{m.value}
            </span>
          </OverlayTrigger>
        ))}
        <CopyButton text={solution} />
      </div>
      <pre className="df-sample-query">{solution}</pre>
      {children}
    </section>
  );
}
