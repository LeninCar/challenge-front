// src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Compatibilidad con código viejo
  const [users] = useState([]);     // ya no los cargamos
  const [loading] = useState(false);

  // Restaurar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parseando currentUser de localStorage:", e);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  // login llamado después de /api/auth/google
  const login = (user, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const value = {
    // 🔹 compat con código anterior
    users,
    loading,
    // 🔹 nuevo
    currentUser,
    setCurrentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
