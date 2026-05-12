import { useState } from "react";
import "./App.css";

import HaikuCard from "./components/HaikuCard";
import MovieWheel from "./components/MovieWheel";

function App() {
  const [mood, setMood] = useState(null);

  return (
    <div className="app">

      {/* Bestehendes Feature */}
      <HaikuCard />

      {/* Header */}
      <header className="header">
        <h1>MoodFlix 🎬</h1>
        <p>Wähle deine Stimmung und finde deinen Film</p>
      </header>

      {/* Hauptbereich */}
      <main className="container">

        {/* Neues Glücksrad */}
        <MovieWheel />

        {mood && (
          <div className="result">
            <h2>Gewählte Stimmung:</h2>
            <p>{mood}</p>
          </div>
        )}

      </main>

    </div>
  );
}

export default App;