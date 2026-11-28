import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { StyleModule } from "style-mod";
import { devfestHighlight, highlightSql } from "./sqlHighlight";

export function SampleQuery({query, game, className}: {query: string; game: string; className?: string}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [preRef, isClamped] = useIsClamped<HTMLPreElement>();
  const highlighted = useMemo(() => <HighlightedSql query={query} game={game} />, [query, game]);
  const preClass = [className, expanded && 'df-query-open'].filter(Boolean).join(' ');

  return (
    <div className="df-query-wrap">
      <pre ref={preRef} className={preClass}>{highlighted}</pre>
      <button type="button" className="df-query-expand" aria-label="View full query" onClick={() => setOpen(true)}>⤢</button>
      {(isClamped || expanded) && (
        <button type="button" className="df-query-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Show more…'}
        </button>
      )}
      <Modal show={open} onHide={() => setOpen(false)} fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>Example query</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="df-query-full">{highlighted}</pre>
        </Modal.Body>
      </Modal>
    </div>
  );
}

function useIsClamped<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const check = () => setValue(el.scrollHeight > el.clientHeight + 1);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, value] as const;
}

function HighlightedSql({query, game}: {query: string; game: string}) {
  // Outside an editor nothing injects the highlight style's CSS rules.
  useEffect(() => StyleModule.mount(document, devfestHighlight.module!), []);
  return highlightSql(query, game).map((seg, i) => seg.className ? <span key={i} className={seg.className}>{seg.text}</span> : seg.text);
}
