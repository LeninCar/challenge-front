import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
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
