import { apiClient } from "./http";

const unwrap = (response) => response.data.data;
const unwrapList = (response) => ({
  items: response.data.items || [],
  pagination: response.data.pagination || null,
  summary: response.data.summary || null,
});
const CHECKOUT_REQUEST_TIMEOUT_MS = 60000;
const CHECKOUT_STATUS_TIMEOUT_MS = 60000;

export const paymentApi = {
  getPricingRules: () => apiClient.get("/payments/pricing-rules").then(unwrap),
  createJobCheckoutSession: (payload) =>
    apiClient
      .post("/payments/checkout/job-request", payload, {
        timeout: CHECKOUT_REQUEST_TIMEOUT_MS,
      })
      .then(unwrap),
  getCheckoutSessionStatus: (sessionId) =>
    apiClient
      .get(`/payments/checkout/session/${sessionId}`, {
        timeout: CHECKOUT_STATUS_TIMEOUT_MS,
      })
      .then(unwrap),
  listPayments: (params = {}) => apiClient.get("/payments", { params }).then(unwrapList),
  getPaymentById: (paymentId) => apiClient.get(`/payments/${paymentId}`).then(unwrap),
};
