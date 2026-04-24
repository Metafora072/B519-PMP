import { apiRequest } from "@/lib/api";

import type {
  CreateTaskInput,
  PaginatedTasks,
  ProjectTaskSummary,
  TaskBoardFilters,
  TaskListFilters,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  UpdateTaskInput,
} from "./types";

export function getProjectTasks(projectId: string, filters: TaskListFilters) {
  return apiRequest<PaginatedTasks, undefined, TaskListFilters>(`/api/projects/${projectId}/tasks`, {
    query: filters,
  });
}

export async function getProjectBoardTasks(projectId: string, filters: TaskBoardFilters) {
  const firstPage = await getProjectTasks(projectId, {
    ...filters,
    page: 1,
    pageSize: 100,
  });

  const pages = Array.from(
    { length: Math.max(0, firstPage.pagination.totalPages - 1) },
    (_, index) => index + 2,
  );

  const otherPages = await Promise.all(
    pages.map((page) =>
      getProjectTasks(projectId, {
        ...filters,
        page,
        pageSize: 100,
      }),
    ),
  );

  return [firstPage, ...otherPages].flatMap((page) => page.items);
}

export function createTask(projectId: string, input: CreateTaskInput) {
  return apiRequest<TaskRecord, CreateTaskInput>(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: input,
  });
}

export function getTask(taskId: string) {
  return apiRequest<TaskRecord>(`/api/tasks/${taskId}`);
}

export function updateTask(taskId: string, input: UpdateTaskInput) {
  return apiRequest<TaskRecord, UpdateTaskInput>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: input,
  });
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  return apiRequest<TaskRecord, { status: TaskStatus }>(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateTaskPriority(taskId: string, priority: TaskPriority) {
  return apiRequest<TaskRecord, { priority: TaskPriority }>(`/api/tasks/${taskId}/priority`, {
    method: "PATCH",
    body: { priority },
  });
}

export function updateTaskAssignee(taskId: string, assigneeId: string | null) {
  return apiRequest<TaskRecord, { assigneeId: string | null }>(`/api/tasks/${taskId}/assignee`, {
    method: "PATCH",
    body: { assigneeId },
  });
}

export async function getProjectTaskSummary(projectId: string) {
  const firstPage = await getProjectTasks(projectId, {
    page: 1,
    pageSize: 100,
  });

  const pages = Array.from(
    { length: Math.max(0, firstPage.pagination.totalPages - 1) },
    (_, index) => index + 2,
  );

  const otherPages = await Promise.all(
    pages.map((page) =>
      getProjectTasks(projectId, {
        page,
        pageSize: 100,
      }),
    ),
  );

  const tasks = [firstPage, ...otherPages].flatMap((page) => page.items);
  const now = Date.now();

  const summary = tasks.reduce<ProjectTaskSummary>(
    (acc, task) => {
      acc.total += 1;

      if (task.status === "IN_PROGRESS") {
        acc.inProgress += 1;
      }

      if (task.status === "DONE" || task.status === "CLOSED") {
        acc.completed += 1;
      }

      if (
        task.dueAt &&
        new Date(task.dueAt).getTime() < now &&
        task.status !== "DONE" &&
        task.status !== "CLOSED"
      ) {
        acc.overdue += 1;
      }

      return acc;
    },
    { total: 0, inProgress: 0, completed: 0, overdue: 0 },
  );

  return summary;
}
