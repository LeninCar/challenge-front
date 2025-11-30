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
    <section className="detail-page">
      <div className="page-header">
        <h2>Detalle de solicitud #{request.id}</h2>
        <p className="page-subtitle">
          Revisa la información, el historial y realiza acciones sobre la solicitud.
        </p>
      </div>

      {/* Tarjeta principal con info de la solicitud */}
      <div className="detail-main-card">
        <div className="detail-main-left">
          <h3 className="detail-title">{request.title}</h3>
          <p className="detail-description">{request.description}</p>

          <div className="detail-meta-row">
            <span className="tag">
              Tipo: <strong>{request.type}</strong>
            </span>
            <span className="tag">
              Estado: <strong>{request.status}</strong>
            </span>
          </div>
        </div>

        <div className="detail-main-right">
          <p>
            <strong>Solicitante:</strong>{" "}
            {request.requester_id ? `#${request.requester_id}` : "N/A"}
          </p>
          <p>
            <strong>Aprobador:</strong>{" "}
            {request.approver_id ? `#${request.approver_id}` : "N/A"}
          </p>
          <p>
            <strong>Creada:</strong>{" "}
            {request.created_at
              ? new Date(request.created_at).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong>Actualizada:</strong>{" "}
            {request.updated_at
              ? new Date(request.updated_at).toLocaleString()
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Grid: Historial + Acciones */}
      <div className="detail-grid">
        {/* Historial */}
        <section className="detail-card">
          <h3 className="detail-card-title">Historial</h3>

          {history && history.length > 0 ? (
            <ul className="history-list">
              {history.map((h) => (
                <li key={h.id} className="history-item">
                  <div className="history-line">
                    <span className="history-dot" />
                    <div className="history-content">
                      <span className="history-date">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                      <div className="history-main">
                        <strong>{h.actor_name || `Usuario #${h.actor_id}`}</strong>
                        <span className="history-status">
                          {h.old_status || "N/A"} → {h.new_status}
                        </span>
                      </div>
                      {h.comment && (
                        <p className="history-comment">“{h.comment}”</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="history-empty">Sin historial todavía.</p>
          )}
        </section>

        {/* Acciones */}
        <section className="detail-card">
          <h3 className="detail-card-title">Acciones</h3>

          <div className="form-field">
            <label>Usuario que actúa</label>
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
          </div>

          <div className="form-field form-field-full" style={{ marginTop: 8 }}>
            <label>Comentario</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opcional: agrega un comentario para el historial"
            />
          </div>

          <div className="detail-actions">
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

          {message && <p className="detail-message">{message}</p>}
        </section>
      </div>
    </section>
  );
}
