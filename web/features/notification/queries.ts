"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications";
import { queryKeys } from "@/services/query-keys";

export function useNotificationsQuery(filters: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => getNotifications(filters),
  });
}

export function useNotificationUnreadCountQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: getNotificationUnreadCount,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
