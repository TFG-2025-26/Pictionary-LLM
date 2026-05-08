import { useNavigate } from "react-router-dom";
import "./GuessingPage.css";

export default function GuessingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="guessing-container">
      <header className="guessing-header">
        <h2>Modo Adivinanza</h2>
        <button onClick={() => navigate("/singleplayer")}>Volver al menú</button>
      </header>
      <p>En construcción...</p>
    </div>
  );
}
