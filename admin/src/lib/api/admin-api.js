import { apiClient } from "./http";

const unwrapData = (response) => response.data.data;

const unwrapCollection = (response) => ({
  items: response.data.items || [],
  pagination: response.data.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
});

const unwrapCollectionWithSummary = (response) => ({
  items: response.data.items || [],
  pagination: response.data.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  summary: response.data.summary || {},
});

export const adminApi = {
  getDashboardStats: () => apiClient.get("/admin/dashboard").then(unwrapData),
  listHeroes: (params = {}) =>
    apiClient.get("/admin/workers", { params }).then(unwrapCollection),
  getHeroFilters: () => apiClient.get("/admin/workers/meta").then(unwrapData),
  getHeroById: (workerId) => apiClient.get(`/admin/workers/${workerId}`).then(unwrapData),
  approveHero: (workerId) =>
    apiClient.patch(`/admin/workers/${workerId}/approve`).then(unwrapData),
  rejectHero: (workerId) =>
    apiClient.patch(`/admin/workers/${workerId}/reject`).then(unwrapData),
  deleteHero: (workerId) => apiClient.delete(`/admin/workers/${workerId}`).then(unwrapData),
  updateHeroAccountStatus: (workerId, status) =>
    apiClient
      .patch(`/admin/workers/${workerId}/account-status`, { status })
      .then(unwrapData),
  listCustomers: (params = {}) =>
    apiClient.get("/admin/customers", { params }).then(unwrapCollection),
  getCustomerById: (customerId) => apiClient.get(`/admin/customers/${customerId}`).then(unwrapData),
  listTestimonials: (params = {}) =>
    apiClient.get("/admin/testimonials", { params }).then(unwrapCollection),
  listPayments: (params = {}) =>
    apiClient.get("/admin/payments", { params }).then(unwrapCollectionWithSummary),
  getPaymentById: (paymentId) => apiClient.get(`/payments/${paymentId}`).then(unwrapData),
  refundPayment: (paymentId, payload) =>
    apiClient.post(`/payments/${paymentId}/refund`, payload).then(unwrapData),
  acceptDispute: (paymentId) =>
    apiClient.post(`/payments/${paymentId}/dispute/accept`).then(unwrapData),
  submitDisputeEvidence: (paymentId, payload) =>
    apiClient.post(`/payments/${paymentId}/dispute/respond`, payload).then(unwrapData),
  listBookings: (params = {}) =>
    apiClient.get("/admin/bookings", { params }).then(unwrapCollection),
  getBookingById: (jobId) => apiClient.get(`/admin/bookings/${jobId}`).then(unwrapData),
  updateBookingStatus: (bookingId, status) =>
    apiClient.patch(`/admin/bookings/${bookingId}/status`, { status }).then(unwrapData),
  approveBookingCompletion: (bookingId, reviewNotes = "") =>
    apiClient
      .patch(`/admin/bookings/${bookingId}/approve-completion`, { reviewNotes })
      .then(unwrapData),
  getPricingRules: () => apiClient.get("/admin/pricing").then(unwrapData),
  updatePricingRules: (payload) => apiClient.put("/admin/pricing", payload).then(unwrapData),
  getSettings: () => apiClient.get("/admin/settings").then(unwrapData),
  updateSettings: (payload) => apiClient.patch("/admin/settings", payload).then(unwrapData),
  updateCurrentProfile: (payload) => apiClient.patch("/users/profile", payload).then(unwrapData),
  changeProfilePassword: (payload) =>
    apiClient.patch("/users/profile/password", payload).then(unwrapData),
  listSupportConversations: (params = {}) =>
    apiClient.get("/support/conversations", { params }).then(unwrapCollection),
  getSupportConversation: (conversationId) =>
    apiClient.get(`/support/conversations/${conversationId}`).then(unwrapData),
  replyToSupportConversation: (conversationId, payload) =>
    apiClient.post(`/support/conversations/${conversationId}/messages`, payload).then(unwrapData),
  updateSupportConversationStatus: (conversationId, status) =>
    apiClient.patch(`/support/conversations/${conversationId}/status`, { status }).then(unwrapData),
  getContentByKey: (key) => apiClient.get(`/content/${key}`).then(unwrapData),
  upsertContent: (key, payload) => apiClient.patch(`/content/${key}`, payload).then(unwrapData),
};
