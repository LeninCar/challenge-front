import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestDetail from "./pages/RequestDetail";

export default function App() {
  const selectedUserName = "maria.garcia"; // luego podemos hacerlo real

  return (
    <Layout
      selectedUser={selectedUserName}
      onBellClick={() => {}}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
      </Routes>
    </Layout>
  );
}
