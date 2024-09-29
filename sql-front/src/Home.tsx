import { useState } from "react";
import { config } from "./config";
import { Button, Form } from "react-bootstrap";

export function Home() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');

  const handleFetch = async () => {
    try {
      const res = await fetch(`${config.api}/exercises`, {
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
      <ul>
        <li>Register by completing the form below</li>
        <li>Then pick one of the tabs to start exercises and score points!</li>
        <li>ATTN: if a select has two times the same column name, the property values will be overwritten</li>
      </ul>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="inputName">Enter your name:</Form.Label>
        <Form.Control
          type="text"
          id="inputName"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" onClick={handleFetch}>Submit</Button>
      <div>{response}</div>
    </>
  )
}
