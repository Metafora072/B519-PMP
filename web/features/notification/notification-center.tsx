"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationUnreadCountQuery,
  useNotificationsQuery,
} from "@/features/notification/queries";
import { formatDateTime } from "@/lib/format";
import { useTaskDrawerStore } from "@/store/task-drawer-store";

export function NotificationCenter() {
  const router = useRouter();
  const openDrawer = useTaskDrawerStore((state) => state.openDrawer);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unreadCountQuery = useNotificationUnreadCountQuery();
  const notificationsQuery = useNotificationsQuery({
    page: 1,
    pageSize: 20,
    unreadOnly: tab === "unread",
  });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const notifications = useMemo(() => notificationsQuery.data?.items ?? [], [notificationsQuery.data]);

  async function handleOpenNotification(notificationId: string, projectId?: string | null, taskId?: string | null) {
    if (!taskId && !projectId) {
      return;
    }

    await markReadMutation.mutateAsync(notificationId);

    if (projectId && taskId) {
      openDrawer({ projectId, taskId });
      router.push(`/projects/${projectId}/tasks`);
      setOpen(false);
      return;
    }

    if (projectId) {
      router.push(`/projects/${projectId}`);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e5e6eb] bg-[#fbfcfe] text-[#646a73] transition hover:bg-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#d83931] px-1 text-[11px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[75]">
          <div className="absolute inset-0 bg-[#0f172a]/14" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto border-l border-[#e8edf4] bg-white shadow-[-24px_0_64px_rgba(15,23,42,0.18)]">
            <div className="sticky top-0 z-10 border-b border-[#eef1f6] bg-white/95 px-5 py-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#8b95a7]">通知中心</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[#1f2329]">系统提醒</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#f5f7fa] p-1">
                  <button
                    type="button"
                    onClick={() => setTab("all")}
                    className={`rounded-full px-4 py-2 text-sm ${
                      tab === "all" ? "bg-white text-[#1f2329] shadow-sm" : "text-[#646a73]"
                    }`}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("unread")}
                    className={`rounded-full px-4 py-2 text-sm ${
                      tab === "unread" ? "bg-white text-[#1f2329] shadow-sm" : "text-[#646a73]"
                    }`}
                  >
                    未读
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void markAllReadMutation.mutateAsync()}
                  disabled={markAllReadMutation.isPending || unreadCount === 0}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  全部已读
                </Button>
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              {notificationsQuery.isLoading ? (
                <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm text-[#8b95a7]">
                  正在加载通知...
                </div>
              ) : notificationsQuery.isError ? (
                <div className="rounded-[20px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-5 text-sm text-[#d83931]">
                  {notificationsQuery.error.message}
                </div>
              ) : notifications.length ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      void handleOpenNotification(
                        notification.id,
                        notification.relatedProjectId,
                        notification.relatedTaskId,
                      )
                    }
                    className={`w-full rounded-[22px] border p-4 text-left transition ${
                      notification.isRead
                        ? "border-[#e8edf4] bg-white hover:border-[#c9d7ff]"
                        : "border-[#d7e4ff] bg-[#f7faff] hover:border-[#b7caff]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1f2329]">{notification.title}</p>
                        {notification.content ? (
                          <p className="mt-1 text-sm leading-6 text-[#646a73]">{notification.content}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8b95a7]">
                          {notification.project ? <span>{notification.project.name}</span> : null}
                          {notification.task ? <span>{notification.task.title}</span> : null}
                          <span>{formatDateTime(notification.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!notification.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-[#3370ff]" /> : null}
                        <ExternalLink className="h-4 w-4 text-[#8b95a7]" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm leading-7 text-[#8b95a7]">
                  当前没有通知。
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
