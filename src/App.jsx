// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestDetail from "./pages/RequestDetail";
import RequestTypesAdmin from "./pages/RequestTypesAdmin";
import PendingRequests from "./pages/PendingRequests.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ChooseRole from "./pages/ChooseRole.jsx";

export default function App() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!currentUser.role) {
    return (
      <Routes>
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route path="*" element={<Navigate to="/choose-role" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/pending" element={<PendingRequests />} />
        <Route path="/admin/request-types" element={<RequestTypesAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
