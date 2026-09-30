import { apiClient } from "./http";

const unwrap = (response) => response.data.data;

const unwrapList = (response) => ({
  items: response.data.items || [],
  pagination: response.data.pagination || null,
});

export const supportApi = {
  createConversation: (payload) =>
    apiClient.post("/support/conversations", payload).then(unwrap),
  listConversations: (params = {}) =>
    apiClient.get("/support/conversations", { params }).then(unwrapList),
  getConversation: (conversationId) =>
    apiClient.get(`/support/conversations/${conversationId}`).then(unwrap),
  addMessage: (conversationId, payload) =>
    apiClient.post(`/support/conversations/${conversationId}/messages`, payload).then(unwrap),
};
