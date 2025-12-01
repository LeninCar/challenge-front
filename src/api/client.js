// src/api/client.js (o donde lo tengas)
import axios from "axios";

// En dev: usa VITE_API_URL
// En producción (Vercel): si no hay variable, usa "/api"
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Antes de cada request, agregamos el header con el usuario actual
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem("currentUserId");
  if (userId) {
    config.headers["x-user-id"] = userId;
  }
  return config;
});

export default api;
