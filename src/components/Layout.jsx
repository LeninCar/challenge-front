import { Link } from "react-router-dom";

export default function Layout({ children, selectedUser, onBellClick }) {
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Sistema de Aprobaciones</h1>
          <p>Gestión de solicitudes del CoE de Desarrollo</p>
        </div>

        <div className="header-right">
          <div className="user-select">
            <input className="user-input" value={selectedUser} readOnly />
            <span className="user-dropdown-arrow">▾</span>
          </div>

          <button
            className="icon-button"
            title="Notificaciones"
            onClick={onBellClick}
          >
            🔔
            <span className="badge-notification">1</span>
          </button>

          <Link to="/create">
            <button className="primary-button">
              + Nueva Solicitud
            </button>
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
}
