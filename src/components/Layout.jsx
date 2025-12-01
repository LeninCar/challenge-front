// src/components/Layout.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markNotificationRead,
} from "../api/notificationsApi";

export default function Layout({ children }) {
  const { users, currentUser, setCurrentUser, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loadingNotis, setLoadingNotis] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function loadNotifications() {
    if (!currentUser) return;
    try {
      setLoadingNotis(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setLoadingNotis(false);
    }
  }

  // 🔹 NUEVO: cada vez que cambie el usuario actual, recargamos notificaciones
  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleBellClick = async () => {
    const newShow = !showPanel;
    setShowPanel(newShow);
    if (newShow) {
      // si quieres puedes volver a recargar al abrir, o quitar esta línea
      await loadNotifications();
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read_at) {
        const updated = await markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? updated : n))
        );
      }
      if (notif.request_id) {
        navigate(`/requests/${notif.request_id}`);
      }
    } catch (err) {
      console.error("Error al marcar notificación:", err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Sistema de Aprobaciones</h1>
          <p>Gestión de solicitudes del CoE de Desarrollo</p>
        </div>

        <div className="header-right" style={{ position: "relative" }}>
          {/* Selector de usuario actual */}
          <div className="user-select">
            {loading ? (
              <input
                className="user-input"
                value="Cargando usuarios..."
                readOnly
              />
            ) : (
              <select
                className="user-input"
                value={currentUser?.id || ""}
                onChange={(e) => {
                  const u = users.find(
                    (x) => x.id === Number(e.target.value)
                  );
                  if (u) setCurrentUser(u);
                }}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Campana de notificaciones */}
          <button
            className="icon-button"
            title="Notificaciones"
            onClick={handleBellClick}
          >
            🔔
            {unreadCount > 0 && (
              <span className="badge-notification">{unreadCount}</span>
            )}
          </button>

          {/* Botón Nueva Solicitud */}
          <Link to="/create">
            <button className="primary-button">+ Nueva Solicitud</button>
          </Link>

          {/* Panel flotante de notificaciones */}
          {showPanel && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <span>Notificaciones</span>
                {loadingNotis && (
                  <span className="notif-loading">Cargando...</span>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 && (
                  <p className="notifications-empty">
                    No tienes notificaciones por ahora.
                  </p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={
                      "notification-item" +
                      (n.read_at ? " notification-read" : "")
                    }
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="notification-main">
                      <span className="notification-text">{n.message}</span>
                      <span className="notification-date">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
