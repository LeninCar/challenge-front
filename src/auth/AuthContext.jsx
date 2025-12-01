import { createContext, useContext, useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios y restaurar user desde localStorage si existe
  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers();
        setUsers(data);

        const storedId = localStorage.getItem("currentUserId");
        const fromStorage = data.find((u) => String(u.id) === storedId);

        if (fromStorage) {
          setCurrentUser(fromStorage);
        } else if (data.length > 0) {
          setCurrentUser(data[0]); // primero de la lista
        }
      } catch (err) {
        console.error("Error cargando usuarios en AuthContext:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cuando cambia currentUser, guardar su id en localStorage
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem("currentUserId", String(currentUser.id));
    }
  }, [currentUser]);

  const value = {
    users,
    currentUser,
    setCurrentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
