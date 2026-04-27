import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await login(username, password);
      navigate("/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    }
  };

  return (
    <section className="login-page">
      <h1>Iniciar Sesión</h1>
      <label>
        Usuario
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>
      <label>
        Contraseña
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="button" onClick={handleLogin}>Entrar</button>
    </section>
  );
}