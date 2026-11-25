import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";
import { formatValue } from "./formatValue";

export function ExerciseSampleData() {
  const data = useAppSelector(state => {
    if (!state.exercises.selected) {
      return null;
    }
    return state.exercises[state.exercises.selected].exampleData;
  });

  if (!data || !data.length) {
    return <p><b>No data!</b></p>
  }

  return <ExercisesData data={data} className="df-sample-table" />
}

export function ExercisesData({data, className}: {data: Record<string, unknown>[]; className?: string}) {
  if (!data.length) {
    return <b>No resulting data!</b>
  }

  return (
    <Table striped bordered size="sm" className={className}>
      <TableHeader obj={data[0]} />
      <TableBody data={data} />
    </Table>
  )
}


function TableHeader({obj}: {obj: Record<string, unknown>}) {
  const cols = Object.keys(obj);
  return (
    <thead>
      <tr>
        {cols.map(col => <th key={col} style={{textAlign: 'center'}}>{col}</th>)}
      </tr>
    </thead>
  )
}


function TableBody({data}: {data: Record<string, unknown>[]}) {
  const cols = Object.keys(data[0]);
  return (
    <tbody>
      {data.map((record, index) => (
        <tr key={index}>
          {cols.map(col => <Cell key={col} col={col} value={record[col]} />)}
        </tr>
      ))}
    </tbody>
  )
}

function Cell({col, value}: {col: string; value: unknown}) {
  const { node, alignRight } = formatValue(value);
  return <td data-label={col} style={alignRight ? {textAlign: 'right'} : undefined}>{node}</td>;
}
