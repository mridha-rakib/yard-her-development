import { apiClient } from "./http";

const unwrapItem = (response) => response.data.data;

const unwrapList = (response) => ({
  items: response.data.items || [],
  pagination: response.data.pagination || null,
  summary: response.data.summary || null,
});

export const jobsApi = {
  listAvailableJobs: (params = {}) =>
    apiClient.get("/jobs/available", { params }).then(unwrapList),
  listMyJobs: (params = {}) => apiClient.get("/jobs/my", { params }).then(unwrapList),
  getJobById: (jobId) => apiClient.get(`/jobs/${jobId}`).then(unwrapItem),
  acceptJob: (jobId) => apiClient.post(`/jobs/${jobId}/accept`).then(unwrapItem),
};
