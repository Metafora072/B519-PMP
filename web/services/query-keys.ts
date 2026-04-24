export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (projectId: string) => ["projects", projectId] as const,
    members: (projectId: string) => ["projects", projectId, "members"] as const,
    modules: (projectId: string) => ["projects", projectId, "modules"] as const,
    taskSummary: (projectId: string) => ["projects", projectId, "task-summary"] as const,
    tasks: (projectId: string) => ["projects", projectId, "tasks"] as const,
    taskList: (projectId: string, filters: Record<string, unknown>) =>
      ["projects", projectId, "tasks", filters] as const,
    board: (projectId: string, filters: Record<string, unknown>) =>
      ["projects", projectId, "board", filters] as const,
  },
  tasks: {
    detail: (taskId: string) => ["tasks", taskId] as const,
  },
};
