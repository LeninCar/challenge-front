import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRequestTypes } from "../api/requestTypesApi";
import { createRequest } from "../api/requestsApi";
import { getUsers } from "../api/usersApi";          // 👈 NUEVO
import { useAuth } from "../auth/AuthContext";
import RequestTypesModal from "../components/RequestTypesModal";

export default function CreateRequest() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();                 // 👈 SOLO currentUser del contexto

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    approver_id: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [showTypesModal, setShowTypesModal] = useState(false);

  // 👇 NUEVO: usuarios y loading de usuarios (ya no vienen del AuthContext)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Cargar tipos
  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const data = await getRequestTypes();
        setTypes(data);
      } catch (err) {
        console.error("Error cargando tipos de solicitud:", err);
        setErrorMsg("No se pudieron cargar los tipos de solicitud.");
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  // 👇 NUEVO: cargar usuarios desde la API
  useEffect(() => {
    (async () => {
      try {
        setLoadingUsers(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        setErrorMsg("No se pudieron cargar los usuarios.");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // Aprobadores
  const approvers = useMemo(
    () => users.filter((u) => u.role === "aprobador" || u.role === "approver"),
    [users]
  );

  // Agrupar tipos por categoría
  const typesByCategory = useMemo(() => {
    return types.reduce((acc, t) => {
      acc[t.category] = acc[t.category] || [];
      acc[t.category].push(t);
      return acc;
    }, {});
  }, [types]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUser) {
      setErrorMsg(
        "Debes iniciar sesión para crear solicitudes."
      );
      return;
    }
    if (!form.type) {
      setErrorMsg("Debes seleccionar un tipo de solicitud.");
      return;
    }
    if (!form.approver_id) {
      setErrorMsg("Debes seleccionar un aprobador.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        approver_id: Number(form.approver_id),
        // requester_id lo toma el backend desde req.user (currentUser)
      };

      const created = await createRequest(payload);

      setSuccessMsg(`Solicitud #${created.id} creada correctamente.`);
      setForm({
        title: "",
        description: "",
        type: "",
        approver_id: "",
      });

      navigate(`/requests/${created.id}`);
    } catch (err) {
      console.error("Error creando solicitud:", err);
      setErrorMsg(
        err.response?.data?.error || "Ocurrió un error creando la solicitud."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cuando el modal crea un tipo nuevo
  const handleTypeCreated = (created) => {
    setTypes((prev) => [...prev, created]);
    setForm((prev) => ({ ...prev, type: created.key }));
  };

  return (
    <div className="page create-request-page">
      <h2>Nueva solicitud</h2>

      <div className="create-request-meta">
        <p>
          <strong>Solicitante:</strong>{" "}
          {currentUser
            ? `${currentUser.name} (${currentUser.role})`
            : "Inicia sesión para crear solicitudes"}
        </p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form className="create-request-form" onSubmit={handleSubmit}>
        {/* Título */}
        <label className="form-field">
          <span className="form-label">Título</span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej. Despliegue nueva versión del servicio de pagos"
            className="form-input"
            required
          />
        </label>

        {/* Descripción */}
        <label className="form-field">
          <span className="form-label">Descripción</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe el contexto, impacto, entorno, ventanas de tiempo, etc."
            className="form-textarea"
            required
          />
        </label>

        {/* Tipo + botón modal */}
        <label className="form-field">
          <div className="form-label-row">
            <span className="form-label">Tipo de solicitud</span>
            <button
              type="button"
              className="chip-button small"
              onClick={() => setShowTypesModal(true)}
            >
              Ver / Crear tipos
            </button>
          </div>

          {loadingTypes ? (
            <div className="field-inline-hint">Cargando tipos...</div>
          ) : (
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Selecciona un tipo...</option>
              {Object.entries(typesByCategory).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((t) => (
                    <option key={t.id} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}

          {form.type && (
            <small className="field-hint">
              {types.find((t) => t.key === form.type)?.description ??
                "Tipo seleccionado."}
            </small>
          )}
        </label>

        {/* Aprobador */}
        <label className="form-field">
          <span className="form-label">Aprobador</span>

          {loadingUsers ? (
            <div className="field-inline-hint">Cargando usuarios...</div>
          ) : approvers.length === 0 ? (
            <div className="field-inline-hint">
              No hay usuarios con rol de aprobador.
            </div>
          ) : (
            <select
              name="approver_id"
              value={form.approver_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Selecciona un aprobador...</option>
              {approvers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email || u.role})
                </option>
              ))}
            </select>
          )}
        </label>

        {/* Botones */}
        <div className="form-actions-right">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={submitting || !currentUser}
          >
            {submitting ? "Creando..." : "Crear solicitud"}
          </button>
        </div>
      </form>


      {/* Modal de tipos */}
      <RequestTypesModal
        open={showTypesModal}
        onClose={() => setShowTypesModal(false)}
        types={types}
        onTypeCreated={handleTypeCreated}
      />
    </div>
  );
}
