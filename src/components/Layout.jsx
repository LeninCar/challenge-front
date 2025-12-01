// src/components/Layout.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markNotificationRead,
} from "../api/notificationsApi";

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
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

  // Cada vez que cambie el usuario actual, recargamos notificaciones
  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleBellClick = async () => {
    const newShow = !showPanel;
    setShowPanel(newShow);
    if (newShow) {
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

  // Inicial para “avatar”
  const userInitial =
    currentUser?.name?.[0]?.toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <Link to="/" className="home-link">
            <div className="title-main">
              <span className="title-badge">✔</span>
              <span className="title-text">Sistema de Aprobaciones</span>
            </div>
            <p className="title-sub">
              CoE de Desarrollo · Solicitudes y flujos de aprobación
            </p>
          </Link>
        </div>

        <div className="header-right" style={{ position: "relative" }}>
          {/* 👤 Info de usuario logueado */}
          <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {currentUser ? (
              <>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    backgroundColor: "#eee",
                  }}
                >
                  {userInitial}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>
                    {currentUser.name || currentUser.email}
                  </span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {currentUser.email}
                    {currentUser.role ? ` · ${currentUser.role}` : ""}
                  </span>
                </div>
                <button
                  className="secondary-button"
                  onClick={logout}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <span style={{ fontStyle: "italic" }}>No autenticado</span>
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
                      "notification-item " +
                      (n.read_at ? "is-read" : "is-unread")
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
