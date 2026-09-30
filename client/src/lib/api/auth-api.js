import { apiClient, publicApi } from "./http";

const unwrap = (response) => response.data.data;

export const authApi = {
  login: (payload) => publicApi.post("/auth/login", payload).then(unwrap),
  registerCustomer: (payload) => publicApi.post("/auth/register", payload).then(unwrap),
  registerHero: (payload) => apiClient.post("/auth/worker-register", payload).then(unwrap),
  switchRole: (payload) => apiClient.post("/auth/switch-role", payload).then(unwrap),
  requestEmailVerificationCode: (payload = {}) =>
    apiClient.post("/auth/email-verification/request", payload).then(unwrap),
  verifyEmailVerificationCode: (payload) =>
    apiClient.post("/auth/email-verification/verify", payload).then(unwrap),
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
