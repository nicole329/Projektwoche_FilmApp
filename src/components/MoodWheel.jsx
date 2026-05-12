import { useState } from "react";
import "./MoodWheel.css";

const moods = [
  { key: "happy", emoji: "😄", color: "#FFD93D" },
  { key: "sad", emoji: "😢", color: "#4D96FF" },
  { key: "action", emoji: "💥", color: "#FF6B6B" },
  { key: "chill", emoji: "😌", color: "#6BCB77" },
  { key: "romance", emoji: "❤️", color: "#FF8FAB" },
  { key: "horror", emoji: "👻", color: "#2B2D42" },
];

export default function MoodWheel({ onSelectMood }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;

    setSpinning(true);

    const randomIndex = Math.floor(Math.random() * moods.length);
    const degreesPerSlice = 360 / moods.length;

    const extraSpins = 5 * 360;
    const finalRotation =
      extraSpins + (360 - randomIndex * degreesPerSlice);

    setRotation((prev) => prev + finalRotation);

    setTimeout(() => {
      setSpinning(false);

      if (onSelectMood) {
        onSelectMood(moods[randomIndex].key);
      }
    }, 3000);
  };

  return (
    <div className="wheel-container">
      <div
        className="wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "3s ease-out" : "none",
        }}
      >
        {moods.map((m, i) => (
          <div
            key={i}
            className="slice"
            style={{ background: m.color }}
          >
            {m.emoji}
          </div>
        ))}
      </div>

      <button onClick={spin} disabled={spinning}>
        🎡 Spin
      </button>
    </div>
  );
}