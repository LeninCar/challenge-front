// src/components/GoogleLoginButton.jsx
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function GoogleLoginButton() {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      const res = await api.post("/auth/google", { credential });

      const { token, user } = res.data;

      login(user, token);
    } catch (err) {
      console.error("Error en login con Google:", err);
      alert("Error al iniciar sesión con Google");
    }
  };

  const handleError = () => {
    console.error("Login de Google falló");
    alert("No se pudo iniciar sesión con Google");
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
