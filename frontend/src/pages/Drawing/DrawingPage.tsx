import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
import { useModel } from "../../context/ModelContext";

const getApiUrl = () => {
  // if (import.meta.env.PROD) {
  //   return "";
  // }

  return `http://${window.location.hostname}:8000`;
}

const API_BASE_URL = getApiUrl();

export default function DrawingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const token = localStorage.getItem("token");

  const [gameState, setGameState] = useState<'waiting' | 'drawing' | 'success'>('waiting');
  const [targetWord, setTargetWord] = useState("");
  const [aiPrediction, setAiPrediction] = useState("");
  const [score, setScore] = useState(100);
  const [message, setMessage] = useState("¿Listo para demostrar tu arte?");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const resumeGame = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/draw/resume`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.active) {
          setTargetWord(data.word);
          setScore(data.score);
          setGameState('drawing');
          setMessage("¡Partida recuperada! Sigue dibujando.");
        }
      } catch (err) {
        console.error("Error al recuperar partida:", err);
      }
    };
    resumeGame();
  }, [token]);

  useEffect(() => {
    if (gameState !== 'drawing') return;

    const interval = setInterval(() => {
      sendCanvasToAI();
    }, 10000); // 10000 ms = 10 segundos

    return () => clearInterval(interval); // Limpieza al cambiar de estado o salir
  }, [gameState, targetWord]);

  const sendCanvasToAI = async () => {
    const blob = await canvasRef.current?.getBlob();
    if (!blob) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", blob, "canvas.png");

    try {
      const res = await fetch(`${API_BASE_URL}/draw/check`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (data.correct) {
        setGameState('success');
        setScore(data.score);
        setMessage(`¡La IA lo ha adivinado! Era un(a) ${data.label.toUpperCase()}. Has ganado ${data.score} puntos.`);
      } else {
        setAiPrediction(data.label || "Nada aún...");
        setScore(data.score);
        setMessage("La IA está observando... ¡sigue dibujando!");
      }
    } catch (err) {
      console.error("Error enviando el lienzo:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startNewGame = async () => {
    setMessage("Generando palabra secreta...");
    canvasRef.current?.clear();
    setAiPrediction("");

    try {
      const res = await fetch(`${API_BASE_URL}/draw/start`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      setTargetWord(data.word);
      setScore(100);
      setGameState('drawing');
      setMessage("¡Empieza a dibujar!");
    } catch (err) {
      setMessage("Error al iniciar la partida.");
    }
  };

  const handleAbandon = async () => {
    if (!window.confirm("¿Seguro que te rindes?")) return;

    try {
      await fetch(`${API_BASE_URL}/draw/abandon`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setMessage(`Te has rendido. La palabra objetiva era: ${targetWord.toUpperCase()}`);
      setGameState('waiting');
      setTargetWord("");
    } catch (err) {
      console.error("Error al abandonar:", err);
    }
  };


  return (
    <div className="guessing-container">
      <header className="guessing-header">
        <h2>Modo Dibujo</h2>
        <p className="score-badge">Puntos en juego: <strong>{score}</strong></p>
      </header>

      <div className="game-box">
        <div className="canvas-section">
          <DrawingCanvas ref={canvasRef} />
          <div className="ingame-buttons">
            <button className="clear-btn" onClick={() => canvasRef.current?.clear()} disabled={gameState !== 'drawing'}>🧹 Limpiar lienzo</button>
            {gameState === 'drawing' && (
              <button className="abandon-btn" onClick={handleAbandon}>Me rindo</button>
            )}
          </div>
        </div>

        <div className="input-section">
          {gameState === 'drawing' && (
            <div className="target-word-box">
              <h3>TIENES QUE DIBUJAR:</h3>
              <h1 className="word-highlight">{targetWord.toUpperCase().replace("_", " ")}</h1>
            </div>
          )}

          <p className="status-msg">{message}</p>

          {aiPrediction && gameState === 'drawing' && (
            <div className="prediction-box">
              <p>Última suposición de la IA:</p>
              <h2 className="ai-guess">¿Es un(a) <strong>{aiPrediction}</strong>?</h2>
            </div>
          )}

          {isAnalyzing && <p className="loading-text">La IA está analizando tu trazo...</p>}

          {gameState === 'waiting' && (
            <button className="btn-main" onClick={startNewGame}>¡Empezar a Dibujar!</button>
          )}

          {gameState === 'success' && (
            <button className="btn-main" onClick={startNewGame}>Jugar otra vez</button>
          )}
        </div>
      </div>

      <button className="back-btn" onClick={() => navigate("/singleplayer")}>Salir al menú</button>
    </div>
  );
}