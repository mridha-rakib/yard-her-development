import axios from "axios";
import { API_BASE_URL } from "./config";
import {
  clearStoredAuthSession,
  getAccessToken,
  getRefreshToken,
  patchStoredAuthSession,
} from "./auth-session";

const DEFAULT_API_TIMEOUT_MS = 30000;

export const getApiErrorMessage = (error) =>
  error?.code === "ECONNABORTED" || String(error?.message || "").toLowerCase().includes("timeout")
    ? String(error?.config?.url || "").includes("/admin/dashboard")
      ? "Loading dashboard data is taking longer than expected. Please refresh and try again."
      : String(error?.config?.url || "").includes("/admin")
        ? "Loading admin data is taking longer than expected. Please try again."
        : "The request is taking longer than expected. Please try again."
    :
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong";

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_API_TIMEOUT_MS,
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_API_TIMEOUT_MS,
});

let refreshRequest = null;

const isAuthEndpoint = (url = "") =>
  ["/auth/login", "/auth/register", "/auth/worker-register", "/auth/refresh"].some((path) =>
    url.includes(path)
  );

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  if (!refreshRequest) {
    refreshRequest = publicApi
      .post("/auth/refresh", { refreshToken })
      .then(({ data }) => {
        patchStoredAuthSession(data.data);
        return data.data.tokens.accessToken;
      })
      .catch((error) => {
        clearStoredAuthSession();
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      clearStoredAuthSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextAccessToken = await refreshAccessToken();
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearStoredAuthSession();
      return Promise.reject(refreshError);
    }
  }
);
