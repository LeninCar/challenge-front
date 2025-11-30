import { useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";
import { createRequest } from "../api/requestsApi";
import { useNavigate } from "react-router-dom";

export default function CreateRequest() {
  const [users, setUsers] = useState([]);
  const [requesterId, setRequesterId] = useState("");
  const [approverId, setApproverId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("despliegue");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setMessage("Error cargando usuarios");
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await createRequest({
        title,
        description,
        type,
        requester_id: Number(requesterId),
        approver_id: Number(approverId),
      });
      setMessage(`Solicitud creada con id ${res.id}`);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Error creando solicitud");
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <h2>Crear nueva solicitud</h2>
        <p className="page-subtitle">
          Completa la información para enviar una solicitud al CoE de Desarrollo.
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Solicitante */}
          <div className="form-field">
            <label>Solicitante</label>
            <select
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {users
                .filter((u) => u.role === "solicitante" || u.role === "admin")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Aprobador */}
          <div className="form-field">
            <label>Aprobador</label>
            <select
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {users
                .filter((u) => u.role === "aprobador")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Título */}
          <div className="form-field">
            <label>Título de la solicitud</label>
            <input
              type="text"
              placeholder="Ej. Despliegue microservicio de pagos v1.2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Tipo */}
          <div className="form-field">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="despliegue">Despliegue</option>
              <option value="acceso">Acceso</option>
              <option value="cambio técnico">Cambio Técnico</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="form-field form-field-full">
            <label>Descripción</label>
            <textarea
              rows={4}
              placeholder="Describe brevemente el cambio, impacto y justificación..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-footer">
          {message && <span className="form-message">{message}</span>}
          <button type="submit" className="primary-button">
            Crear solicitud
          </button>
        </div>
      </form>
    </section>
  );
}
