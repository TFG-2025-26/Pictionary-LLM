import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas, { type DrawingCanvasRef } from "../../components/DrawingCanvas/DrawingCanvas";
import { useModel } from "../../context/ModelContext";

export default function DrawingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const { prediction, isModelLoading, guessImage } = useModel();

  const handlePredict = async () => {
    const blob = await canvasRef.current?.getBlob();
    if (blob) await guessImage(blob);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <header className="guessing-header">
        <h2>Modo Adivinanza</h2>
        <button onClick={() => navigate("/singleplayer")}>Volver al menú</button>
      </header>
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