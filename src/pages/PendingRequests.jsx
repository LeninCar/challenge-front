import { useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";
import { getPendingRequests } from "../api/requestsApi";
import { Link } from "react-router-dom";

export default function PendingRequests() {
  const [users, setUsers] = useState([]);
  const [approverId, setApproverId] = useState("");
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers();
        setUsers(data.filter((u) => u.role === "aprobador"));
      } catch (err) {
        console.error(err);
        setMessage("Error cargando aprobadores");
      }
    })();
  }, []);

  async function handleLoad() {
    setMessage("");
    if (!approverId) {
      setMessage("Selecciona un aprobador");
      return;
    }
    try {
      const data = await getPendingRequests(Number(approverId));
      setRequests(data);
      if (data.length === 0) {
        setMessage("No hay solicitudes pendientes para este aprobador");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error cargando solicitudes");
    }
  }

  return (
    <div>
      <h2>Bandeja de Aprobador</h2>

      <div style={{ marginBottom: "12px" }}>
        <label>
          Aprobador:
          <select
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
            style={{ marginLeft: "8px" }}
          >
            <option value="">Seleccione...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleLoad} style={{ marginLeft: "8px" }}>
          Cargar pendientes
        </button>
      </div>

      {message && <p>{message}</p>}

      <ul>
        {requests.map((r) => (
          <li key={r.id} style={{ marginBottom: "8px" }}>
            <strong>{r.title}</strong> — {r.type} — estado: {r.status}{" "}
            <Link to={`/requests/${r.id}`}>Ver detalle</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
