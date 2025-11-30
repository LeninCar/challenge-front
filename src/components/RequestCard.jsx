const STATUS_LABELS = {
  pendiente: { label: "Pendiente", className: "badge badge-pending" },
  aprobado: { label: "Aprobado", className: "badge badge-approved" },
  rechazado: { label: "Rechazado", className: "badge badge-rejected" },
};

const TYPE_COLORS = {
  despliegue: "tag tag-blue",
  acceso: "tag tag-gray",
  "cambio técnico": "tag tag-green",
};

export default function RequestCard({ req, onClick }) {
  const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.pendiente;

  const typeKey = (req.type || "").toLowerCase();
  const typeClass = TYPE_COLORS[typeKey] || "tag";

  return (
    <article className="request-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <header className="request-card-header">
        <h3 title={req.title}>{req.title}</h3>
        <span className={statusInfo.className}>{statusInfo.label}</span>
      </header>

      <p className="request-description" title={req.description}>
        {req.description}
      </p>

      <div className="request-meta-top">
        <span className={typeClass}>{req.type}</span>
        <span className="request-id">ID: {req.id}</span>
      </div>

      <footer className="request-card-footer">
        <div className="request-footer-left">
          <span className="user-icon">👤</span>
          <span className="request-users">
            {req.requester_id && `Solicitante #${req.requester_id}`}{" "}
            {req.approver_id && `→ Aprobador #${req.approver_id}`}
          </span>
        </div>
        <div className="request-footer-right">
          <span className="clock-icon">🕒</span>
          <span className="request-date">
            {new Date(req.created_at).toLocaleDateString()}
          </span>
        </div>
      </footer>
    </article>
  );
}
