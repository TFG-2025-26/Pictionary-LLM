import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./SinglePlayerPage.css";

export default function SinglePlayerPage() {
  const navigate = useNavigate();
  const { logout } = useUser();

  return (
    <section className="single-player-page">
      <h1>Un jugador</h1>
      <button onClick={() => navigate("/menu")}>Volver al menú</button>
      
      <div className="menu-grid">
        <button className="practice-btn" type="button" onClick={() => navigate("/practice")}>
          Práctica
        </button>
        <button className="drawing-btn" type="button" onClick={() => navigate("/drawing")}>
          Tú dibujas, la IA adivina
        </button>
        <button className="guessing-btn" type="button" onClick={() => navigate("/guessing")}>
          La IA dibuja mientras tú adivinas
        </button>
      </div>

      <button type="button" onClick={logout}>Logout</button>
    </section>
  );
}
