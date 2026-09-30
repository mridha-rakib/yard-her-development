import { apiClient } from "./http";

const unwrap = (response) => response.data.data;

export const jobChatApi = {
  getConversation: (jobId) => apiClient.get(`/jobs/${jobId}/chat`).then(unwrap),
  addMessage: (jobId, payload) =>
    apiClient.post(`/jobs/${jobId}/chat/messages`, payload).then(unwrap),
};
