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
    <div style={{ padding: "2rem" }}>
      <h1>Flujo de Aprobación CoE</h1>
      <p>Inicia sesión para continuar</p>

      <GoogleLoginButton />
    </div>
  );
}
