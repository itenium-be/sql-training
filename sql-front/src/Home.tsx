import { useState } from "react";

export function Home() {
  const [sql, setSql] = useState('');
  const [response, setResponse] = useState('');

  const handleFetch = async () => {
    try {
      const res = await fetch('http://localhost:8080/exercises', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ text: sql }),
      });
      const data = await res.json();
      setResponse(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <h1>SQL Training</h1>
      <textarea
        value={sql}
        onChange={e => setSql(e.target.value)}
        placeholder="Enter your SQL"
        style={{width: '100%', height: 350}}
      />
      <button onClick={handleFetch}>Submit</button>
      <div>{response}</div>
    </>
  )
}
