import { useState } from "react";
import "./App.css";

import HaikuCard from "./components/HaikuCard";
import MoodWheel from "./components/MoodWheel";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  const [mood, setMood] = useState(null);

  return (
    <div className="app">
      
      {/* optional: dein bestehendes Feature bleibt drin */}
      <HaikuCard />

      {/* Hauptbereich deiner neuen App */}
      <header className="header">
        <h1>MoodFlix 🎬</h1>
        <p>Wähle deine Stimmung und finde deinen Film</p>
      </header>

      <main className="container">
       {/* <MoodWheel onSelectMood={(selectedMood) => setMood(selectedMood)} /> */}

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