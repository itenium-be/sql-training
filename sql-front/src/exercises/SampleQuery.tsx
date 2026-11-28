import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";

export function SampleQuery({query, className}: {query: string; className?: string}) {
  const [open, setOpen] = useState(false);
  const [preRef, isClamped] = useIsClamped<HTMLPreElement>();

  return (
    <div className="df-query-wrap">
      <pre ref={preRef} className={className}>{query}</pre>
      <button type="button" className="df-query-expand" aria-label="View full query" onClick={() => setOpen(true)}>⤢</button>
      {isClamped && (
        <button type="button" className="df-query-more" onClick={() => setOpen(true)}>Show full query ⤢</button>
      )}
      <Modal show={open} onHide={() => setOpen(false)} fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>Example query</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="df-query-full">{query}</pre>
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
