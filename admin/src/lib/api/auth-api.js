import { apiClient, publicApi } from "./http";

const unwrap = (response) => response.data.data;

export const authApi = {
  login: (payload) => publicApi.post("/auth/login", payload).then(unwrap),
  requestPasswordResetCode: (payload) =>
    publicApi.post("/auth/forgot-password/request", payload).then(unwrap),
  verifyPasswordResetCode: (payload) =>
    publicApi.post("/auth/forgot-password/verify", payload).then(unwrap),
  resetPasswordWithToken: (payload) =>
    publicApi.post("/auth/forgot-password/reset", payload).then(unwrap),
  refresh: (refreshToken) => publicApi.post("/auth/refresh", { refreshToken }).then(unwrap),
  getCurrentUser: () => apiClient.get("/auth/me").then(unwrap),
  logout: () => apiClient.post("/auth/logout").then(unwrap),
  logoutAll: () => apiClient.post("/auth/logout-all").then(unwrap),
};
