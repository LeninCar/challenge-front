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
      <h2>Administrar tipos de solicitud</h2>
      <p>Define qué tipos existen en el sistema de aprobaciones.</p>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="request-types-layout">
        {/* Formulario de creación */}
        <form className="request-type-form" onSubmit={handleCreate}>
          <h3>Nuevo tipo</h3>

          <label className="form-field">
            <span>Key (técnica)</span>
            <input
              name="key"
              value={form.key}
              onChange={handleChange}
              placeholder="ej: despliegue, acceso, cambio_tecnico"
              required
            />
          </label>

          <label className="form-field">
            <span>Nombre visible</span>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="ej: Despliegue de versión"
              required
            />
          </label>

          <label className="form-field">
            <span>Categoría</span>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="ej: Despliegues, Accesos, Cambios"
              required
            />
          </label>

          <label className="form-field">
            <span>Descripción</span>
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

        {/* Tabla de tipos */}
        <div className="request-types-table">
          <h3>Tipos existentes</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : types.length === 0 ? (
            <p>No hay tipos configurados todavía.</p>
          ) : (
            <table>
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
                    <td>{t.key}</td>
                    <td>{t.label}</td>
                    <td>{t.category}</td>
                    <td>
                      <span
                        className={
                          t.active
                            ? "status-pill status-active"
                            : "status-pill status-inactive"
                        }
                      >
                        {t.active ? "Activo" : "Inactivo"}
                      </span>
                      <button
                        type="button"
                        className="small-button"
                        style={{ marginLeft: "8px" }}
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
      </div>
    </div>
  );
}
