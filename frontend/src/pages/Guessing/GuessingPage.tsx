import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
import "./GuessingPage.css";

export default function GuessingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [gameState, setGameState] = useState<'waiting' | 'drawing' | 'finished'>('waiting');
  const [currentWord, setCurrentWord] = useState("");
  const [userGuess, setUserGuess] = useState("");

  const startRound = async () => {
    const word = "sheep"; // Esto vendría de tu lista de modelos
    setCurrentWord(word);
    setGameState('drawing');
    
    if (canvasRef.current) {
      await canvasRef.current.drawModel(word);
      setGameState('finished');
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <header className="guessing-header">
        <h2>Modo Adivinanza</h2>
        <button onClick={() => navigate("/singleplayer")}>Volver al menú</button>
      </header>

      <input 
        value={userGuess} 
        onChange={(e) => {
          setUserGuess(e.target.value);
          if(e.target.value.toLowerCase() === currentWord) alert("¡GANASTE!");
        }}
        placeholder="¿Qué está dibujando la IA?"
      />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <DrawingCanvas ref={canvasRef} />
      </div>
      <button onClick={startRound}>Siguiente dibujo</button>
    </div>
  );
}