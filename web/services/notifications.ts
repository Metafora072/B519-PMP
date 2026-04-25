import { apiRequest } from "@/lib/api";

import type { PaginatedNotifications } from "./types";

export function getNotifications(filters: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  return apiRequest<PaginatedNotifications, undefined, typeof filters>("/api/notifications", {
    query: filters,
  });
}

export function getNotificationUnreadCount() {
  return apiRequest<{ count: number }>("/api/notifications/unread-count");
}

export function markNotificationRead(notificationId: string) {
  return apiRequest<{ message: string }>(`/api/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ message: string }>("/api/notifications/read-all", {
    method: "POST",
  });
}
