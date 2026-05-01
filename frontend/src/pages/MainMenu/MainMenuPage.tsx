import { Link } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./MainMenuPage.css";

export default function MainMenuPage() {
  const { session, logout } = useUser();

  return (
    <section className="menu-page">
      <h1>Menu Principal</h1>
      <p>Bienvenido, {session?.username}</p>
      <div className="menu-grid">
        <Link to="/practice">Practica</Link>
        <Link to="/multiplayer">Multijugador</Link>
      </div>

      {/*este es el boton de logout para poder desconectarme*/}
      <button type="button" onClick={logout}>Logout</button>
    </section>
  );
}
