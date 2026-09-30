export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9898/api/v1";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const AUTH_STORAGE_KEY = "yard-website-auth";
