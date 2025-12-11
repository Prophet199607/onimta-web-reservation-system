// config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:9307";
const REPORT_API_URL = import.meta.env.VITE_REPORT_API_URL || "http://localhost:50538";

// Log for debugging
console.log("Environment Variables:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_REPORT_API_URL: import.meta.env.VITE_REPORT_API_URL,
  MODE: import.meta.env.MODE
});

export { API_BASE_URL, REPORT_API_URL };