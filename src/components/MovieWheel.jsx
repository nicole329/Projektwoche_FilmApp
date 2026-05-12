import { useState } from "react";
import { Box, Button } from "@mui/material";
import "./MovieWheel.css";

const symbols = ["🎥", "🎬", "🎥", "🎬", "🎥", "🎬", "🎥", "🎬"];

export default function MovieWheel() {
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    const extraRotation = Math.floor(Math.random() * 360);
    const newRotation = rotation + 3600 + extraRotation;

    setRotation(newRotation);
  };

  return (
    <Box className="movie-wheel-wrapper">
      <Box className="wheel-container">
        <Box className="pointer" />

        <Box
          className="wheel"
          sx={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {symbols.map((symbol, index) => (
            <Box
              key={index}
              className="segment"
              sx={{
                transform: `rotate(${index * -45 + 24}deg) translate(0, -210px)`,
              }}
            >
              {symbol}
            </Box>
          ))}
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={spinWheel}
        className="spin-button"
      >
        Drehen
      </Button>
    </Box>
  );
}