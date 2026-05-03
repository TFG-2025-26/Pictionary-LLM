import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./MainMenuPage.css";

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { session, logout } = useUser();

  return (
    <section className="menu-page">
      <h1>Menu Principal</h1>
      <p>Bienvenido, {session?.username}</p>
      <div className="menu-grid">
        <button className="single-player-btn" type="button" onClick={() => navigate("/practice")}>
          Practica
        </button>
        <button className="multiplayer-btn" type="button" onClick={() => navigate("/multiplayer")}>
          Multijugador
        </button>
      </div>

      {/*este es el boton de logout para poder desconectarme*/}
      <button type="button" onClick={logout}>Logout</button>
    </section>
  );
}
