// src/pages/Login.jsx
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { currentUser } = useAuth();

  // Si ya está logueado, redirige al dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <span>✔</span>
        </div>

        <h1 className="login-title">Sistema de Aprobaciones CoE</h1>

        <p className="login-subtitle">
          Inicia sesión con tu cuenta corporativa para continuar
        </p>

        <GoogleLoginButton />

        <p className="login-footer-text">
          Acceso seguro · Google Identity Services
        </p>
      </div>
    </div>
  );
}
