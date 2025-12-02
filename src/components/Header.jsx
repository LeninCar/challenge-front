// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState, useRef } from "react";
import {
  getMyNotifications,
  markNotificationRead,
} from "../api/notificationsApi";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotis, setShowNotis] = useState(false);
  const [loadingNotis, setLoadingNotis] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef(null);
  const notiRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  // ─────────────── Load notis ───────────────
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

  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
  }, [currentUser]);

  // auto-refresh cada 30s
  useEffect(() => {
    if (!currentUser) return;

    const intervalId = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const toggleNotis = () => {
    setShowNotis(!showNotis);
    setShowUserMenu(false);
    if (!showNotis) loadNotifications();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotis(false);
  };

  async function handleNotificationClick(n) {
    try {
      if (!n.read_at) {
        const updated = await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? updated : x))
        );
      }
      if (n.request_id) navigate(`/requests/${n.request_id}`);
    } catch (err) {
      console.error(err);
    }
  }

  // cerrar menú si hago clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setShowUserMenu(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setShowNotis(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial =
    currentUser?.name?.[0]?.toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="home-link">
          <div className="title-main">
            <span className="title-badge">✔</span>
            <span className="title-text">Sistema de Aprobaciones</span>
          </div>
          <p className="title-sub">CoE de Desarrollo · Solicitudes y flujos</p>
        </Link>
      </div>

      <div className="header-right">

        {/* Notificaciones */}
        <div className="header-icon-container" ref={notiRef}>
          <button className="icon-button" onClick={toggleNotis}>
            🔔
            {unreadCount > 0 && (
              <span className="badge-notification">{unreadCount}</span>
            )}
          </button>

          {showNotis && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <span>Notificaciones</span>
                {loadingNotis && <span className="notif-loading">Cargando...</span>}
              </div>

              <div className="notifications-list">
                {notifications.length === 0 && (
                  <p className="notifications-empty">Sin notificaciones.</p>
                )}

                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={`notification-item ${
                      n.read_at ? "is-read" : "is-unread"
                    }`}
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

        {/* Nueva solicitud */}
        <Link to="/create">
          <button className="primary-button">+ Nueva Solicitud</button>
        </Link>

        {/* Usuario */}
        <div className="header-user" ref={userMenuRef}>
          <button className="user-pill" onClick={toggleUserMenu}>
            <div className="user-circle">{userInitial}</div>
            <span className="user-name">
              {currentUser?.name || currentUser?.email}
            </span>
          </button>

          {showUserMenu && (
            <div className="user-menu">
              <button className="user-menu-item" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
