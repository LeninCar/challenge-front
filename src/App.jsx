// src/App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestDetail from "./pages/RequestDetail";
import RequestTypesAdmin from "./pages/RequestTypesAdmin";
import Login from "./pages/Login.jsx";

// Layout protegido: solo se muestra si hay currentUser
function ProtectedLayout() {
  const { currentUser } = useAuth();

  // Si no hay usuario logueado, redirige a /login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const selectedUserName =
    currentUser.name || currentUser.email || "Usuario";

  return (
    <Layout
      selectedUser={selectedUserName}
      onBellClick={() => {
        // aquí luego puedes abrir notificaciones reales
      }}
    >
      {/* Las páginas hijas se renderizan aquí */}
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Ruta pública: login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas, todas usan el mismo Layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/admin/request-types" element={<RequestTypesAdmin />} />
      </Route>

      {/* Cualquier otra ruta → redirige al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
