// src/api/client.js
import axios from "axios";

// En dev: usa VITE_API_URL
// En producción (Vercel): si no hay variable, usa "/api"
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Antes de cada request, agregamos el header con el token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // 🟡 Si quieres mantener compatibilidad temporal con x-user-id:
  // const storedUser = localStorage.getItem("currentUser");
  // if (storedUser) {
  //   const user = JSON.parse(storedUser);
  //   config.headers["x-user-id"] = user.id;
  // }

  return config;
});

export default api;
