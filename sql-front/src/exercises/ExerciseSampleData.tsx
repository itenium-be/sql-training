import { Table } from "react-bootstrap";
import { useAppSelector } from "../store";

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

  return <ExercisesData data={data} />
}

export function ExercisesData({data}: {data: any[]}) {
  if (!data.length) {
    return <b>No resulting data!</b>
  }

  return (
    <Table striped bordered size="sm">
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
      {data.map((record, index) => (
        <tr key={record.id ?? index}>
          {cols.map(col => <Cell key={col} value={record[col]} />)}
        </tr>
      ))}
    </tbody>
  )
}

function Cell({value}: {value: any}) {
  if (value === null)
    return <td><i>NULL</i></td>

  if (typeof value === 'string' && (value.includes(' ') || value[0] === '+'))
    return <td>{value}</td>

  if (!isNaN(parseInt(value)) && value[value.length - 1] !== '%')
    return <td style={{textAlign: 'right'}}>{(+value).toLocaleString().replace(/,/g, '.')}</td>

  return <td>{value}</td>
}
