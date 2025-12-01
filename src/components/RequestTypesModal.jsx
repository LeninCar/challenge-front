// src/components/RequestTypesModal.jsx
import { useState } from "react";
import { createRequestType } from "../api/requestTypesApi";

export default function RequestTypesModal({
  open,
  onClose,
  types,
  onTypeCreated,
}) {
  const [typeForm, setTypeForm] = useState({
    key: "",
    label: "",
    category: "",
    description: "",
  });
  const [savingType, setSavingType] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTypeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setSavingType(true);

      const payload = {
        key: typeForm.key.trim(),
        label: typeForm.label.trim(),
        category: typeForm.category.trim(),
        description: typeForm.description.trim() || null,
      };

      const created = await createRequestType(payload);

      // Avisar al padre
      onTypeCreated?.(created);

      // Limpiar formulario
      setTypeForm({
        key: "",
        label: "",
        category: "",
        description: "",
      });

      setSuccessMsg(`Tipo "${created.label}" creado correctamente.`);
    } catch (err) {
      console.error("Error creando tipo:", err);
      setErrorMsg(
        err.response?.data?.error || "Error creando tipo de solicitud."
      );
    } finally {
      setSavingType(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal request-types-modal">
        <div className="modal-header">
          <div>
            <h3>Gestionar tipos de solicitud</h3>
            <p className="modal-subtitle">
              Consulta los tipos existentes y crea nuevos sin salir de esta
              pantalla.
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body request-types-body">
          {/* Columna izquierda: tabla */}
          <div className="modal-column">
            <h4>Tipos existentes</h4>
            {types.length === 0 ? (
              <p className="hint-text">Todavía no hay tipos registrados.</p>
            ) : (
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className="tag-pill">{t.key}</span>
                      </td>
                      <td>{t.label}</td>
                      <td>{t.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Columna derecha: formulario */}
          <div className="modal-column">
            <h4>Crear nuevo tipo</h4>

            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
            {successMsg && (
              <div className="alert alert-success">{successMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="request-type-form">
              <label className="form-field">
                <span>Key (técnica)</span>
                <input
                  name="key"
                  value={typeForm.key}
                  onChange={handleChange}
                  placeholder="ej: despliegue, acceso, cambio_tecnico"
                  required
                />
              </label>

              <label className="form-field">
                <span>Nombre visible</span>
                <input
                  name="label"
                  value={typeForm.label}
                  onChange={handleChange}
                  placeholder="ej: Despliegue de versión"
                  required
                />
              </label>

              <label className="form-field">
                <span>Categoría</span>
                <input
                  name="category"
                  value={typeForm.category}
                  onChange={handleChange}
                  placeholder="ej: Despliegues, Accesos, Cambios"
                  required
                />
              </label>

              <label className="form-field">
                <span>Descripción</span>
                <textarea
                  name="description"
                  value={typeForm.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción corta para que el equipo sepa cuándo usar este tipo."
                />
              </label>

              <button
                type="submit"
                className="primary-button full-width"
                disabled={savingType}
              >
                {savingType ? "Guardando..." : "Crear tipo"}
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
