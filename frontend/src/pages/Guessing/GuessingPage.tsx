import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
import "./GuessingPage.css";

const getApiUrl = () => {
  // if (import.meta.env.PROD) {
  //   return "";
  // }

  return `http://${window.location.hostname}:8000`;
}

const API_BASE_URL = getApiUrl();

export default function GuessingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  
  const token = localStorage.getItem("token");
  
  const [gameState, setGameState] = useState<'waiting' | 'drawing' | 'success'>('waiting');
  const [userGuess, setUserGuess] = useState("");
  const [modelId, setModelId] = useState("");
  const [score, setScore] = useState(100);
  const [message, setMessage] = useState("¿Preparado?");


  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/guess/resume`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.active) {
          setModelId(data.model_id);
          setScore(data.score);
          setMessage(data.message);
          setGameState('drawing');
          
          setTimeout(() => {
            canvasRef.current?.drawModel(data.model_id);
          }, 500);
        }
      } catch (err) {
        console.error("Error recuperando partida:", err);
      }
    };

    checkActiveGame();
  }, []);


  const startNewGame = async () => {
    setMessage("La IA está pensando...");
    const res = await fetch(`${API_BASE_URL}/guess/start`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    
    setModelId(data.model_id);
    setGameState('drawing');
    setScore(100);
    setUserGuess("");

    if (canvasRef.current) {
      await canvasRef.current.drawModel(data.model_id);
    }
  };

  const handleGuess = async () => {
    const res = await fetch(`${API_BASE_URL}/guess/try`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ guess: userGuess })
    });
    const data = await res.json();

    if (data.correct) {
      setGameState('success');
      setMessage(`¡Correcto! Has ganado ${data.score} puntos.`);
      setScore(data.score);
    } else {
      setMessage("¡Error! Inténtalo de nuevo.");
      setScore(data.score);
      setUserGuess("");
    }
  };

  const handleRedraw = async () => {

    const res = await fetch(`${API_BASE_URL}/guess/redraw`, { 
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` } 
    });
    const data = await res.json();
    setScore(data.current_score);

    if (canvasRef.current) {
      await canvasRef.current.drawModel(modelId);
    }
  };

  const handleAbandon = async () => {
    if (!window.confirm("¿Seguro que quieres rendirte? Perderás el progreso de esta palabra.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/guess/abandon`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      setMessage(`Te rendiste. La palabra era: ${data.word.toUpperCase()}`);
      setGameState('waiting');
      setModelId("");
      setUserGuess("");
      
      if (canvasRef.current) {
          canvasRef.current.clear();
      }
    } catch (err) {
      console.error("Error al abandonar:", err);
    }
  };

  return (
    <div className="guessing-container">
      <header className="guessing-header">
        <h2>Modo Adivinanza</h2>
        <p>Puntos actuales: <strong>{score}</strong></p>
      </header>

      <div className="game-box">
        <div className="canvas-section">
          <DrawingCanvas ref={canvasRef} />
          {gameState === 'drawing' && (
            <div className="ingame-buttons">
              <button className="redraw-btn" onClick={handleRedraw}>Redibujar</button>
              <button className="abandon-btn" onClick={handleAbandon}>Me rindo</button>
            </div>
          )}
        </div>

        <div className="input-section">
          <p className="status-msg">{message}</p>
          
          {gameState !== 'success' ? (
            <>
              <input 
                value={userGuess} 
                onChange={(e) => setUserGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="Escribe tu respuesta..."
                disabled={gameState === 'waiting'}
              />
              <button onClick={handleGuess} disabled={gameState === 'waiting'}>Enviar</button>
            </>
          ) : (
            <button className="start-btn" onClick={startNewGame}>Jugar otra vez</button>
          )}
          
          {gameState === 'waiting' && (
            <button className="start-btn" onClick={startNewGame}>¡Empezar Juego!</button>
          )}
        </div>
      </div>
      
      <button className="back-btn" onClick={() => navigate("/singleplayer")}>Salir</button>
    </div>
  );
}