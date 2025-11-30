import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRequestDetail, changeRequestStatus } from "../api/requestsApi";
import { getUsers } from "../api/usersApi";

export default function RequestDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [actorId, setActorId] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  async function loadDetail() {
    try {
      const detail = await getRequestDetail(id);
      setData(detail);
    } catch (err) {
      console.error(err);
      setMessage("Error cargando detalle");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const u = await getUsers();
        setUsers(u);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function handleChangeStatus(newStatus) {
    setMessage("");
    if (!actorId) {
      setMessage("Selecciona quién realiza la acción");
      return;
    }
    try {
      await changeRequestStatus(id, {
        newStatus,
        comment,
        actor_id: Number(actorId),
      });
      setComment("");
      setMessage(`Solicitud ${newStatus}`);
      await loadDetail();
    } catch (err) {
      console.error(err);
      setMessage("Error cambiando estado");
    }
  }

  if (!data) return <p>Cargando...</p>;

  const { request, history } = data;

  return (
    <div>
      <h2>Detalle de solicitud #{request.id}</h2>

      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
        }}
      >
        <p><strong>Título:</strong> {request.title}</p>
        <p><strong>Tipo:</strong> {request.type}</p>
        <p><strong>Estado:</strong> {request.status}</p>
        <p><strong>Descripción:</strong> {request.description}</p>
      </div>

      <h3>Historial</h3>
      <ul>
        {history.map((h) => (
          <li key={h.id}>
            [{new Date(h.created_at).toLocaleString()}]{" "}
            <strong>{h.actor_name}</strong>: {h.old_status || "N/A"} →{" "}
            {h.new_status} ({h.comment})
          </li>
        ))}
        {history.length === 0 && <p>Sin historial todavía.</p>}
      </ul>

      <h3>Acciones</h3>
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          maxWidth: "480px",
        }}
      >
        <label>
          Usuario que actúa
          <select
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginTop: "8px" }}>
          Comentario
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleChangeStatus("aprobado")}
            className="primary-button"
          >
            Aprobar
          </button>
          <button
            onClick={() => handleChangeStatus("rechazado")}
            className="primary-button"
            style={{ backgroundColor: "#991b1b" }}
          >
            Rechazar
          </button>
        </div>

        {message && <p style={{ marginTop: "8px" }}>{message}</p>}
      </div>
    </div>
  );
}
