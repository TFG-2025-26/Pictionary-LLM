import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import "./RegisterPage.css";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useUser();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await register(formData.username, formData.email, formData.password);
      navigate("/", { state: { message: "¡Registrado exitosamente! Ya puedes iniciar sesión." } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    }
  };

  return (
    <section className="register-page">
      <h1>Registro</h1>
      <label>
        Username
        <input name="username" value={formData.username} onChange={onChange} required />
      </label>
      <label>
        Correo
        <input type="email" name="email" value={formData.email} onChange={onChange} required />
      </label>
      <label>
        Contraseña
        <input type="password" name="password" value={formData.password} onChange={onChange} required />
      </label>
      <label>
        Confirmar contraseña
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange} required />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="button" onClick={handleRegister}>Crear cuenta</button>
    </section>
  );
}