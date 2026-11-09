import { Badge } from "react-bootstrap";

export function ScoreBadge({points}: {points: number}) {
  return (
    <Badge bg="secondary" style={{fontSize: 14}}>
      {points} point{points === 1 ? '' : 's'}
    </Badge>
  )
}
