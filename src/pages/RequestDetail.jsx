// src/pages/RequestDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRequestDetail, changeRequestStatus } from "../api/requestsApi";
import { useAuth } from "../auth/AuthContext";

export default function RequestDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  async function loadDetail() {
    try {
      const detail = await getRequestDetail(id);
      setData(detail);
      setMessage("");
    } catch (err) {
      console.error("Error cargando detalle:", err);
      const backendMsg = err.response?.data?.error;
      setMessage(
        backendMsg || "Error cargando detalle de la solicitud. Revisa los logs."
      );
    }
  }

  // Carga inicial cuando cambia el id
  useEffect(() => {
    if (!id) return;
    loadDetail();
  }, [id]);

  // 🔁 Auto-refresh del detalle / historial cada 10 segundos
  useEffect(() => {
    if (!id) return;

    const intervalId = setInterval(() => {
      loadDetail();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [id]);

  if (!data) return <p>Cargando...</p>;

  const { request, history } = data;

  // 🧾 Etiquetas amigables para solicitante / aprobador
  const requesterLabel =
    request.requester_name ||
    request.requester_email ||
    (request.requester_id ? `#${request.requester_id}` : "N/A");

  const approverLabel =
    request.approver_name ||
    request.approver_email ||
    (request.approver_id ? `#${request.approver_id}` : "N/A");

  // ¿El usuario actual es el aprobador asignado?
  const canChangeStatus =
    !!currentUser &&
    !!request &&
    Number(currentUser.id) === Number(request.approver_id);

  async function handleChangeStatus(newStatus) {
    setMessage("");

    if (!currentUser) {
      setMessage("No hay usuario actual seleccionado en el header.");
      return;
    }

    // Candado extra en el front (aunque el backend también lo valida)
    if (!canChangeStatus) {
      setMessage(
        "No tienes permiso para cambiar el estado de esta solicitud. Solo el aprobador asignado puede aprobar o rechazar."
      );
      return;
    }

    try {
      const result = await changeRequestStatus(id, {
        newStatus,
        comment,
        // el backend toma actor_id desde req.user.id
      });

      setComment("");

      // 👇 USAR SIEMPRE EL MENSAJE DEL BACKEND SI VIENE
      if (result?.message) {
        setMessage(result.message);
      } else if (result?.request?.status) {
        setMessage(`Solicitud actualizada a estado "${result.request.status}".`);
      } else {
        setMessage(`Solicitud actualizada a estado "${newStatus}".`);
      }

      // Si realmente hubo cambio, recargo el detalle
      if (result?.changed) {
        await loadDetail();
      }
    } catch (err) {
      console.error("Error cambiando estado:", err);
      const backendMsg = err.response?.data?.error;
      setMessage(
        backendMsg ||
          `Error cambiando estado de la solicitud: ${
            err.message || "Error desconocido"
          }.`
      );
    }
  }

  return (
    <section className="detail-page">
      <div className="page-header">
        <h2>Detalle de solicitud #{request.id}</h2>
        <p className="page-subtitle">
          Revisa la información, el historial y realiza acciones sobre la
          solicitud.
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
            <strong>Solicitante:</strong> {requesterLabel}
          </p>
          <p>
            <strong>Aprobador:</strong> {approverLabel}
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
                        <strong>
                          {h.actor_name || `Usuario #${h.actor_id}`}
                        </strong>
                        <span className="history-status">
                          {h.old_status || "Nueva"} → {h.new_status}
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

          {/* Usuario actual */}
          <div className="form-field">
            <label>Usuario que actúa</label>
            <input
              type="text"
              value={
                currentUser
                  ? `${currentUser.name} (${currentUser.role})`
                  : "Sin usuario actual"
              }
              disabled
            />
          </div>

          {/* Aviso de permisos */}
          {!canChangeStatus && (
            <div
              className="detail-message detail-message-info"
              style={{ marginTop: 8 }}
            >
              Esta solicitud solo puede ser aprobada o rechazada por el
              aprobador asignado (ID #{request.approver_id}).
            </div>
          )}

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
              disabled={!canChangeStatus}
              style={
                !canChangeStatus
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : undefined
              }
            >
              Aprobar
            </button>
            <button
              onClick={() => handleChangeStatus("rechazado")}
              className="primary-button"
              style={{
                backgroundColor: "#991b1b",
                ...(!canChangeStatus
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : {}),
              }}
              disabled={!canChangeStatus}
            >
              Rechazar
            </button>
          </div>

          {message && (
            <p className="detail-message" style={{ marginTop: 8 }}>
              {message}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
