import { apiClient } from "./http";

const unwrapItem = (response) => response.data.data;
const unwrapList = (response) => ({
  items: response.data.items || [],
  pagination: response.data.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  summary: response.data.summary || {
    unreadCount: 0,
  },
});

export const notificationsApi = {
  listNotifications: (params = {}) =>
    apiClient.get("/notifications", { params }).then(unwrapList),
  markAsRead: (notificationId) =>
    apiClient.patch(`/notifications/${notificationId}/read`).then(unwrapItem),
  markAllAsRead: () => apiClient.patch("/notifications/read-all").then(unwrapItem),
};
