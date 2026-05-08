// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import DrawingCanvas from "../../components/DrawingCanvas/DrawingCanvas";
// import "./DrawingPage.css";

// export default function DrawingPage() {

//   const navigate = useNavigate();
//   const canvasRef = useRef<{ clear: () => void; getBlob: () => Promise<Blob | null> }>(null);
  
//   const [prediction, setPrediction] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // const [color, setColor] = useState("#000000");
//   // const [size, setSize] = useState(5);
//   // const [isEraser, setIsEraser] = useState(false);

//   const handlePredict = async () => {
//     const blob = await canvasRef.current?.getBlob();
//     if (!blob) return;

//     setIsLoading(true);
//     const formData = new FormData();
//     formData.append("file", blob, "drawing.png");

//     try {
//       const response = await fetch("/guess", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       setPrediction(data.label); 
//     } catch (error) {
//       console.error("Error contactando con la IA:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (

//     <div className="practice-container">
//       <header className="practice-header">
//         <button onClick={() => navigate("/singleplayer")}>Volver al menú</button>
//         <h2>Modo Práctica</h2>
//         <button className="clear-btn" onClick={() => canvasRef.current?.clear()}>
//           Limpiar Lienzo
//         </button>
//       </header>

//       {/* <div className="toolbar">
//         <div className="tool-group">
//           <label>Color:</label>
//           <input 
//             type="color" 
//             value={color} 
//             onChange={(e) => { setColor(e.target.value); setIsEraser(false); }} 
//           />
//         </div>

//         <div className="tool-group">
//           <label>Grosor: {size}</label>
//           <input 
//             type="range" min="1" max="20" 
//             value={size} 
//             onChange={(e) => setSize(Number(e.target.value))} 
//           />
//         </div>

//         <button 
//           className={`tool-btn ${isEraser ? "active" : ""}`}
//           onClick={() => setIsEraser(!isEraser)}
//         >
//           {isEraser ? "🖌️ Usar Pincel" : "🧽 Borrador"}
//         </button>
//       </div> */}

//       <div className="prediction-zone">
//         <button className="predict-btn" onClick={handlePredict} disabled={isLoading}>
//           {isLoading ? "Adivinando..." : "🔮 ¿Qué es esto?"}
//         </button>
//         {prediction && <p>La IA dice: <strong>{prediction}</strong></p>}
//       </div>

//       <main className="canvas-wrapper">
//         <DrawingCanvas 
//           ref={canvasRef} 
//           // color={color} 
//           // lineWidth={size} 
//           // isEraser={isEraser}
//         />
//       </main>
//     </div>
//   );
// }




// import { useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
// import { useModel } from "../../context/ModelContext"; // Asegúrate de importar el hook
// import "./DrawingPage.css";

// export default function DrawingPage() {
//   const navigate = useNavigate();
//   const canvasRef = useRef<DrawingCanvasRef>(null);
  
//   // Extraemos todo del ModelContext
//   const { prediction, isModelLoading, guessImage, clearPrediction } = useModel();

//   const handlePredict = async () => {
//     const blob = await canvasRef.current?.getBlob();
//     if (!blob) return;
    
//     // Llamamos a la función del contexto
//     await guessImage(blob);
//   };

//   const handleClear = () => {
//     canvasRef.current?.clear();
//     clearPrediction();
//   };

//   return (
//     <div className="practice-container">
//       <header className="practice-header">
//         <button onClick={() => navigate("/singleplayer")}>Volver al menú</button>
//         <h2>Modo Práctica</h2>
//         <button className="clear-btn" onClick={handleClear}>
//           Limpiar Lienzo
//         </button>
//       </header>

//       <div className="prediction-zone">
//         <button 
//           className="predict-btn" 
//           onClick={handlePredict} 
//           disabled={isModelLoading}
//         >
//           {isModelLoading ? "Adivinando..." : "🔮 ¿Qué es esto?"}
//         </button>
//         {prediction && (
//           <div className="result-card">
//             <p>La IA dice: <strong>{prediction}</strong></p>
//           </div>
//         )}
//       </div>

//       <main className="canvas-wrapper">
//         <DrawingCanvas ref={canvasRef} />
//       </main>
//     </div>
//   );
// }











































import { useRef } from "react";
import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
import { useModel } from "../../context/ModelContext";

export default function DrawingPage() {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const { prediction, isModelLoading, guessImage, clearPrediction } = useModel();

  const handlePredict = async () => {
    const blob = await canvasRef.current?.getBlob();
    if (blob) await guessImage(blob);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Modo Práctica</h2>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => canvasRef.current?.clear()}>Limpiar</button>
        <button onClick={handlePredict} disabled={isModelLoading}>
          {isModelLoading ? "Analizando..." : "🔮 Adivinar"}
        </button>
      </div>
      
      {prediction && (
        <p style={{ fontSize: "1.5rem" }}>IA: <strong>{prediction}</strong></p>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <DrawingCanvas ref={canvasRef} />
      </div>
    </div>
  );
}