import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const [users] = useState([]); 
  const [loading] = useState(false);

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
    if (token) localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const value = {
    users,
    loading,
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
