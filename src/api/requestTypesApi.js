// src/api/requestTypesApi.js
import api from "./client";

// Listar todos los tipos
export async function getRequestTypes() {
  const res = await api.get("/request-types");
  return res.data;
}

// Crear tipo
export async function createRequestType(payload) {
  const res = await api.post("/request-types", payload);
  return res.data;
}

// Actualizar tipo
export async function updateRequestType(id, payload) {
  const res = await api.patch(`/request-types/${id}`, payload);
  return res.data;
}

// Eliminar (soft delete)
export async function deleteRequestType(id) {
  const res = await api.delete(`/request-types/${id}`);
  return res.data;
}
