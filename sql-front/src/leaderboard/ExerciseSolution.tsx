import { Badge, Button, Modal } from "react-bootstrap";
import { useState } from "react";

export function ExerciseSolution({exerciseId, solution}: {exerciseId: string, solution?: string}) {
  const [show, setShow] = useState(false);

  if (!solution) {
    return exerciseId;
  }

  return (
    <>
      {exerciseId}
      <Button variant="info" size="sm" className="float-end" onClick={() => setShow(true)}>SQL</Button>
      {show && (
        <Modal show size="lg" onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{exerciseId}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <pre>{solution}</pre>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

export function ScoreBadge({points}: {points: number}) {
  return (
    <Badge bg="secondary" style={{fontSize: 14}}>
      {points} point{points === 1 ? '' : 's'}
    </Badge>
  )
}
