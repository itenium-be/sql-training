import { useState } from "react";
import { Image, Row } from "react-bootstrap";
import { useAppSelector } from "./store";
import { RegisterForm } from "./RegisterForm";
import { Beamer } from "./beamer/Beamer";
import { YourScores } from "./leaderboard/YourScores";
import { AllSolutions } from "./leaderboard/AllSolutions";

export function Home() {
  const registeredName = useAppSelector(state => state.exercises.userName);
  const scores = useAppSelector(state => state.exercises.scores);
  const [meme] = useState(() => Math.floor(Math.random() * 18) + 1);

  if (registeredName) {
    return (
      <>
        <Beamer />
        {scores.length > 0 && (
          <>
            <h2 style={{marginTop: 32}}>Your Scores</h2>
            <YourScores scores={scores} />
            <AllSolutions scores={scores} />
          </>
        )}
      </>
    );
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
