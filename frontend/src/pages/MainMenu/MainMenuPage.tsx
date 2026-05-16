import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./MainMenuPage.css";

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { session, logout } = useUser();

  return (
    <section className="menu-page">
      <h1>Menú Principal</h1>
      <p>Bienvenid@, {session?.username}</p>
      
      <div className="menu-grid">
        <button className="single-player-btn" type="button" onClick={() => navigate("/singleplayer")}>
          Un Jugador
        </button>
        {/* <button className="multiplayer-btn" type="button" onClick={() => navigate("/multiplayer")}>
          Multijugador
        </button> */}
      </div>

      <button type="button" onClick={logout}>Logout</button>
    </section>
  );
}
