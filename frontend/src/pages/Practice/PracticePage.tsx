import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
import "./PracticePage.css";

export default function PracticePage() {
  const navigate = useNavigate();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <header className="practice-header">
        <button onClick={() => navigate("/singleplayer")}>Volver al menú</button>
        <h2>Modo Práctica</h2>
        <button className="clear-btn" onClick={() => canvasRef.current?.clear()}>
          Limpiar Lienzo
        </button>
      </header>

      <div className="toolbar">
        <div className="tool-group">
          <label>Color:</label>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => { setColor(e.target.value); setIsEraser(false); }} 
          />
        </div>

        <div className="tool-group">
          <label>Grosor: {size}</label>
          <input 
            type="range" min="1" max="20" 
            value={size} 
            onChange={(e) => setSize(Number(e.target.value))} 
          />
        </div>

        <button 
          className={`tool-btn ${isEraser ? "active" : ""}`}
          onClick={() => setIsEraser(!isEraser)}
        >
          {isEraser ? "Pincel" : "Borrador"}
        </button>
      </div>

      <main className="canvas-wrapper">
        <DrawingCanvas 
          ref={canvasRef} 
          color={color} 
          lineWidth={size} 
          isEraser={isEraser}
        />
      </main>
    </div>
  );
}