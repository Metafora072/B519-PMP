export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    discoverable: ["projects", "discoverable"] as const,
    detail: (projectId: string) => ["projects", projectId] as const,
    members: (projectId: string) => ["projects", projectId, "members"] as const,
    memberWorkloads: (projectId: string) => ["projects", projectId, "member-workloads"] as const,
    modules: (projectId: string) => ["projects", projectId, "modules"] as const,
    activities: (projectId: string, filters: Record<string, unknown>) =>
      ["projects", projectId, "activities", filters] as const,
    taskSummary: (projectId: string) => ["projects", projectId, "task-summary"] as const,
    tasks: (projectId: string) => ["projects", projectId, "tasks"] as const,
    taskList: (projectId: string, filters: Record<string, unknown>) =>
      ["projects", projectId, "tasks", filters] as const,
    board: (projectId: string, filters: Record<string, unknown>) =>
      ["projects", projectId, "board", filters] as const,
  },
  tasks: {
    detail: (taskId: string) => ["tasks", taskId] as const,
    comments: (taskId: string) => ["tasks", taskId, "comments"] as const,
    activities: (taskId: string, filters: Record<string, unknown>) =>
      ["tasks", taskId, "activities", filters] as const,
  },
  me: {
    workbenchSummary: ["me", "workbench", "summary"] as const,
    tasks: (scope: string) => ["me", "tasks", scope] as const,
    pendingActions: ["me", "pending-actions"] as const,
  },
  notifications: {
    list: (filters: Record<string, unknown>) => ["notifications", filters] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
};
