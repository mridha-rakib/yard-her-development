export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const AUTH_STORAGE_KEY = "yard-admin-auth";
