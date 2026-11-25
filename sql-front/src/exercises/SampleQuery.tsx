import { useState } from "react";
import { Modal } from "react-bootstrap";

export function SampleQuery({query, className}: {query: string; className?: string}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="df-query-wrap">
      <pre className={className}>{query}</pre>
      <button type="button" className="df-query-expand" aria-label="View full query" onClick={() => setOpen(true)}>⤢</button>
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
