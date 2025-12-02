// src/api/client.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Limpia todo lo de auth
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");

      // Redirige al login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
