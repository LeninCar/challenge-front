import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../api/usersApi";
import { getRequestsByApprover } from "../api/requestsApi";
import RequestCard from "../components/RequestCard";

function StatCard({ label, value, icon, variant = "default" }) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-header">
        <span>{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [approvers, setApprovers] = useState([]);
  const [approverId, setApproverId] = useState("");
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");      // 🔍 texto de búsqueda
  const [statusFilter, setStatusFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Cargar usuarios aprobadores
  useEffect(() => {
    (async () => {
      try {
        const users = await getUsers();
        const onlyApprovers = users.filter((u) => u.role === "aprobador");
        setApprovers(onlyApprovers);
        if (onlyApprovers.length > 0) {
          setApproverId(String(onlyApprovers[0].id));
        }
      } catch (err) {
        console.error(err);
        setMessage("Error cargando usuarios");
      }
    })();
  }, []);

  // Cargar solicitudes cuando cambia el aprobador
  useEffect(() => {
    (async () => {
      if (!approverId) return;
      try {
        setMessage("");
        const data = await getRequestsByApprover(Number(approverId));
        setRequests(data);
        if (data.length === 0) {
          setMessage("No hay solicitudes para este aprobador.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Error cargando solicitudes.");
      }
    })();
  }, [approverId]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pendiente").length;
    const approved = requests.filter((r) => r.status === "aprobado").length;
    const rejected = requests.filter((r) => r.status === "rechazado").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // 🔍 Filtro de búsqueda + estado + tipo
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const text = `${r.title ?? ""} ${r.description ?? ""} ${r.id ?? ""}`
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" ? true : r.status === statusFilter;

      const matchesType =
        typeFilter === "todos"
          ? true
          : (r.type || "").toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, search, statusFilter, typeFilter]);

  return (
    <section>
      {/* Stats */}
      <section className="stats-grid">
        <StatCard label="Total" value={stats.total} variant="default" />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          variant="warning"
          icon="🔔"
        />
        <StatCard
          label="Aprobadas"
          value={stats.approved}
          variant="success"
          icon="+"
        />
        <StatCard
          label="Rechazadas"
          value={stats.rejected}
          variant="danger"
          icon="+"
        />
      </section>

      {/* Barra de filtros + búsqueda */}
      <section className="filter-bar">
        {/* 🔍 Búsqueda por texto */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por título, descripción o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Selects */}
        <div className="filter-selects">
          {/* Aprobador */}
          <select
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
          >
            {approvers.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobadas</option>
            <option value="rechazado">Rechazadas</option>
          </select>

          {/* Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="despliegue">Despliegue</option>
            <option value="acceso">Acceso</option>
            <option value="cambio técnico">Cambio Técnico</option>
          </select>
        </div>
      </section>

      {message && <p>{message}</p>}

      {/* Cards */}
      <section className="cards-grid">
        {filteredRequests.map((req) => (
          <RequestCard
            key={req.id}
            req={req}
            onClick={() => navigate(`/requests/${req.id}`)}
          />
        ))}
        {filteredRequests.length === 0 && !message && (
          <p style={{ marginTop: "16px" }}>No se encontraron solicitudes.</p>
        )}
      </section>
    </section>
  );
}
