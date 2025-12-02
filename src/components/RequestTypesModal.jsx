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

      onTypeCreated?.(created);

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

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Gestionar tipos de solicitud</h3>
            <p className="modal-subtitle">
              Consulta los tipos existentes y crea nuevos.
            </p>
          </div>

          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="modal-content-columns">
          {/* IZQUIERDA → Tabla */}
          <div className="modal-column">
            <h4 className="section-title">Tipos existentes</h4>

            {types.length === 0 ? (
              <p className="hint-text">Todavía no hay tipos registrados.</p>
            ) : (
              <table className="clean-table">
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
                      <td><span className="tag">{t.key}</span></td>
                      <td>{t.label}</td>
                      <td>{t.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* DERECHA → Formulario */}
          <div className="modal-column">
            <h4 className="section-title">Crear nuevo tipo</h4>

            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="simple-form">
              <label>
                <span>Key técnica</span>
                <input
                  name="key"
                  value={typeForm.key}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Nombre visible</span>
                <input
                  name="label"
                  value={typeForm.label}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Categoría</span>
                <input
                  name="category"
                  value={typeForm.category}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Descripción</span>
                <textarea
                  name="description"
                  value={typeForm.description}
                  onChange={handleChange}
                  rows={3}
                />
              </label>

              <button type="submit" className="primary-button" disabled={savingType}>
                {savingType ? "Guardando..." : "Crear tipo"}
              </button>
            </form>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
