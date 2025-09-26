// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", 
  // 👆 fallback in case env variable isn't set
  withCredentials: true, // optional if you need cookies / auth
});

api.defaults.headers.common["Authorization"] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZ4cms1M20wMDAwdDdpemVwMjA4enRzIiwiZW1haWwiOiJvcmdhbml6ZXIxQGdtYWlsLmNvbSIsInJvbGUiOiJPUkdBTklaRVIiLCJpYXQiOjE3NTg3ODY1MTEsImV4cCI6MTc1OTM5MTMxMX0.hS1pfPH9R6yFQSRY1ucvzQMyTu3hdOtNgpnC6T3SjU4`;

export default api;
