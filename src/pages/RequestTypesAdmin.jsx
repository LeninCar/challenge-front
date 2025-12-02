import { useEffect, useState } from "react";
import {
  getRequestTypes,
  createRequestType,
  updateRequestType,
} from "../api/requestTypesApi";
import { useAuth } from "../auth/AuthContext";

export default function RequestTypesAdmin() {
  const { currentUser } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    key: "",
    label: "",
    category: "",
    description: "",
  });

  async function loadTypes() {
    try {
      setLoading(true);
      const data = await getRequestTypes();
      setTypes(data);
    } catch (err) {
      console.error("Error cargando tipos:", err);
      setErrorMsg("Error cargando tipos de solicitud.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setSaving(true);
      const payload = {
        key: form.key.trim(),
        label: form.label.trim(),
        category: form.category.trim(),
        description: form.description.trim() || null,
      };
      const created = await createRequestType(payload);
      setTypes((prev) => [...prev, created]);
      setForm({ key: "", label: "", category: "", description: "" });
      setSuccessMsg("Tipo creado correctamente.");
      setShowModal(false);
    } catch (err) {
      console.error("Error creando tipo:", err);
      setErrorMsg(
        err.response?.data?.error || "Error creando tipo de solicitud."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      const updated = await updateRequestType(t.id, {
        active: !t.active,
      });
      setTypes((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (err) {
      console.error("Error cambiando estado activo:", err);
      setErrorMsg("Error actualizando estado del tipo.");
    }
  };

  if (!currentUser) {
    return <p>Selecciona un usuario para gestionar tipos de solicitud.</p>;
  }

  return (
    <div className="page request-types-admin">
      <div className="page-header">
        <h2>Gestionar tipos de solicitud</h2>
        <p className="page-subtitle">
          Consulta los tipos existentes y crea nuevos.
        </p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div style={{ marginTop: "20px" }}>
        <button
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          + Crear nuevo tipo
        </button>
      </div>

      {/* Tabla de tipos */}
      <div style={{ marginTop: "24px" }}>
        <h3>Tipos existentes</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : types.length === 0 ? (
          <p>No hay tipos configurados todavía.</p>
        ) : (
          <table className="clean-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="tag">{t.key}</span>
                  </td>
                  <td>{t.label}</td>
                  <td>{t.category}</td>
                  <td>
                    <span
                      className={
                        t.active
                          ? "badge badge-approved"
                          : "badge badge-pending"
                      }
                    >
                      {t.active ? "Activo" : "Inactivo"}
                    </span>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ marginLeft: "8px", padding: "4px 10px" }}
                      onClick={() => toggleActive(t)}
                    >
                      {t.active ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Crear nuevo tipo</h3>
                <p className="modal-subtitle">
                  Define un nuevo tipo de solicitud para el sistema
                </p>
              </div>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form className="simple-form" onSubmit={handleCreate} style={{ padding: "20px 22px" }}>
              <label>
                Key técnica
                <input
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  placeholder="ej: despliegue, acceso, cambio_tecnico"
                  required
                />
              </label>

              <label>
                Nombre visible
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="ej: Despliegue de versión"
                  required
                />
              </label>

              <label>
                Categoría
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="ej: Despliegues, Accesos, Cambios"
                  required
                />
              </label>

              <label>
                Descripción
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción corta para que el equipo sepa cuándo usar este tipo."
                />
              </label>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Crear tipo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}