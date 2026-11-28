import { useEffect, useState } from "react";
import { Image, Row } from "react-bootstrap";
import { useAppSelector } from "./store";
import { RegisterForm } from "./RegisterForm";
import { Dashboard } from "./dashboard/Dashboard";
import { shouldAutoStart } from "./tutorial/autoStart";

export function Home() {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const [meme] = useState(() => Math.floor(Math.random() * 18) + 1);

  useEffect(() => {
    if (shouldAutoStart(localStorage, !!registeredName)) {
      window.location.assign('/tutorial');
    }
  }, [registeredName]);

  if (registeredName) {
    return <Dashboard />;
  }

  return (
    <>
      <div className="df-eyebrow" style={{marginTop: 24}}>Join the showdown</div>
      <h1 style={{marginTop: 8}}>Pick your player name</h1>
      <ul>
        <li>Register by completing the form below</li>
        <li>Then pick one of the tabs to start exercises and score points!</li>
      </ul>

      <RegisterForm />

      <Row style={{marginTop: 25}}>
        <h2>It's Meme Time</h2>
        <p>Refresh for a different one! <small>Clear localStorage after logging in for more memes!</small></p>
        <Image src={`/memes/sql-${meme}.png`} rounded style={{width: 'auto', height: 'auto'}} />
      </Row>
    </>
  )
}
