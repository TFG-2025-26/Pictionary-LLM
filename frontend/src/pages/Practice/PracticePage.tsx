// import DrawingCanvas from "../../components/DrawingCanvas/DrawingCanvas";
// import { useNavigate } from "react-router-dom";
// import "./PracticePage.css";

// export default function PracticePage() {
//   const navigate = useNavigate();

//   const handleClear = () => {
//     // Lógica para limpiar el canvas (podemos añadir una prop al Canvas para esto)
//     window.location.reload(); // Truco rápido por ahora
//   };

//   return (
//     <div className="practice-container">
//       <header className="practice-header">
//         <button onClick={() => navigate("/menu")}>Volver</button>
//         <h2>Modo Práctica</h2>
//         <button onClick={handleClear}>Limpiar</button>
//       </header>

//       <main className="canvas-wrapper">
//         <DrawingCanvas width={800} height={500} />
//       </main>

//       {/* <aside className="ia-panel">
//         <h3>IA Feedback</h3>
//         <p>Dibuja algo y pronto Sketch-RNN te ayudará...</p>
//       </aside> */}
//     </div>
//   );
// }








import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas from "../../components/DrawingCanvas/DrawingCanvas";
import "./PracticePage.css";

export default function PracticePage() {
  const navigate = useNavigate();
  const canvasRef = useRef<{ clear: () => void }>(null); // Referencia al canvas
  
  // Estados para las herramientas
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  return (
    <div className="practice-container">
      <header className="practice-header">
        <button onClick={() => navigate("/menu")}>Volver</button>
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
          {isEraser ? "🖌️ Usar Pincel" : "🧽 Borrador"}
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