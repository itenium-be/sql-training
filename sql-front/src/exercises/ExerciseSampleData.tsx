import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";

export function ExerciseSampleData() {
  const data = useAppSelector(state => state.exercises.exampleData);

  if (!data || !data.length) {
    return <b>No data!</b>
  }

  return (
    <Table striped bordered hover size="sm">
      <TableHeader obj={data[0]} />
      <TableBody data={data} />
    </Table>
  )
}


function TableHeader({obj}: {obj: any}) {
  const cols = Object.keys(obj);
  return (
    <thead>
      <tr>
        {cols.map(col => <th key={col} style={{textAlign: 'center'}}>{col}</th>)}
      </tr>
    </thead>
  )
}


function TableBody({data}: {data: any[]}) {
  const cols = Object.keys(data[0]);
  return (
    <tbody>
      {data.map(record => (
        <tr key={record.id}>
          {cols.map(col => <Cell key={col} value={record[col]} />)}
        </tr>
      ))}
    </tbody>
  )
}

function Cell({value}: {value: any}) {
  if (!isNaN(parseInt(value)))
    return <td style={{textAlign: 'right'}}>{(+value).toLocaleString().replace(/,/g, '.')}</td>

  return <td>{value}</td>
}
