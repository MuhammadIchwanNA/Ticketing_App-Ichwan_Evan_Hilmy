// lib/axios.ts
import axios, { AxiosRequestHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // only if backend needs cookies
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // 👈 get JWT
    if (token) {
      (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
