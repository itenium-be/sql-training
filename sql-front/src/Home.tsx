import { useState } from "react";
import { config } from "./config";
import { Alert, Button, Form, Image, Row } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "./store";
import { Scoreboard } from "./leaderboard/Scoreboard";

export function Home() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');
  const registeredName = useAppSelector(state => state.exercises.userName);
  const dispatch = useAppDispatch();

  if (registeredName) {
    return (
      <>
        <h1>Good Luck {registeredName}</h1>
        <ul>
          <li>Pick one of the tabs to start exercises and score points!</li>
          <li>ATTN: if a select has two times the same column name, the property values will be overwritten</li>
          <li><a href="http://localhost:8080" target="_blank">There is a Swagger</a></li>
        </ul>
        <Scoreboard />
      </>
    )
  }

  const handleFetch = async () => {
    try {
      const res = await fetch(`${config.leaderboard.api}/game/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      setResponse(data.message);
      localStorage.setItem('userName', name);
      dispatch({type: 'exercises/register', payload: name});
    } catch (error: any) {
      console.error('Error:', error);
      setResponse(error.message);
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

      <Button variant="primary" onClick={handleFetch} disabled={!name.length}>Submit</Button>
      {response && (
        <Alert variant="info" style={{marginTop: 16}}>{response}</Alert>
      )}

      <Row style={{marginTop: 25}}>
        <h2>It's Meme Time</h2>
        <p>Refresh for a different one! <small>Clear localStorage after logging in for more memes!</small></p>
        <Image src={`/memes/sql-${Math.floor(Math.random() * 18) + 1}.png`} rounded style={{width: 'auto', height: 'auto'}} />
      </Row>
    </>
  )
}
