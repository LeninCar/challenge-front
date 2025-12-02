import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function ChooseRole() {
  const { currentUser, login } = useAuth();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) {
    return <p>Cargando...</p>;
  }

  const handleSubmit = async () => {
    if (!role) return;
    try {
      setLoading(true);

      const res = await api.patch(`/users/${currentUser.id}/role`, { role });

      // Recupero el token que ya tenía
      const existingToken = localStorage.getItem("authToken");

      // Actualizo el usuario en el contexto con su nuevo rol
      login(res.data, existingToken);

      navigate("/");
    } catch (err) {
      console.error("Error guardando rol:", err);
      alert("Error guardando rol, revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Configura tu cuenta</h1>
        <p className="login-subtitle">
          Selecciona tu rol en el sistema de aprobaciones
        </p>

        <div className="login-role-group">
          <p className="login-role-label">¿Cómo vas a usar el sistema?</p>
          <div className="login-role-options">
            <label className="login-role-option">
              <input
                type="radio"
                name="role"
                value="solicitante"
                checked={role === "solicitante"}
                onChange={() => setRole("solicitante")}
              />
              <span>
                Soy <strong>solicitante</strong> (creo solicitudes)
              </span>
            </label>
            <label className="login-role-option">
              <input
                type="radio"
                name="role"
                value="aprobador"
                checked={role === "aprobador"}
                onChange={() => setRole("aprobador")}
              />
              <span>
                Soy <strong>aprobador</strong> (reviso y apruebo solicitudes)
              </span>
            </label>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={handleSubmit}
          disabled={!role || loading}
        >
          {loading ? "Guardando..." : "Guardar y continuar"}
        </button>
      </div>
    </div>
  );
}
