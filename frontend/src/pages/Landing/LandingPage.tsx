import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./LandingPage.css";

interface LocationState {
  message?: string;
  error?: string;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsGuest } = useUser();
  const { state } = useLocation() as { state: LocationState | null };

  const handleGuest = async () => {
    try {
      await loginAsGuest();
      navigate('/menu');
    } catch (err) {
      console.error("Fallo al entrar como invitado", err);
    }
  }

  return (
    <section className="landing-page">
      <h1>Pictionary AI</h1>
      {/* {state?.message && <p className="success-message">{state.message}</p>}
      {state?.error && <p className="error-message">{state.error}</p>} */}
      <div className="landing-actions">
        <button className="login-guest-btn" type="button" onClick={handleGuest}>
          Jugar como Invitado
        </button>
        <button className="login-btn" type="button" onClick={() => navigate("/login")}>
          Iniciar Sesión
        </button>
        <button className="register-btn" type="button" onClick={() => navigate("/register")}>
          Registrarse
        </button>
      </div>
    </section>
  );
}