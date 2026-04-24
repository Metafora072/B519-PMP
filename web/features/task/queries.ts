"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getTaskActivities } from "@/services/activities";
import {
  createTaskComment,
  deleteTaskComment,
  getTaskComments,
  updateTaskComment,
} from "@/services/comments";
import { queryKeys } from "@/services/query-keys";
import {
  createTask,
  getProjectBoardTasks,
  getProjectTasks,
  getTask,
  updateTask,
  updateTaskAssignee,
  updateTaskPriority,
  updateTaskStatus,
} from "@/services/tasks";

import type {
  ActivityListFilters,
  CreateCommentInput,
  CreateTaskInput,
  PaginatedActivities,
  PaginatedTasks,
  TaskBoardFilters,
  TaskCommentRecord,
  TaskListFilters,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  UpdateCommentInput,
  UpdateTaskInput,
} from "@/services/types";

function isPaginatedTaskData(value: unknown): value is PaginatedTasks {
  return Boolean(
    value &&
      typeof value === "object" &&
      "items" in value &&
      Array.isArray((value as PaginatedTasks).items),
  );
}

export function invalidateProjectTaskData(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  taskId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(projectId) });
  void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "board"] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.taskSummary(projectId) });

  if (taskId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    void queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "activities"] });
  }
}

export function invalidateTaskCollaborationData(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.comments(taskId) });
  void queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "activities"] });
}

export function updateTaskInProjectTaskCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  taskId: string,
  updater: (task: TaskRecord) => TaskRecord,
) {
  queryClient.setQueriesData(
    { queryKey: queryKeys.projects.tasks(projectId) },
    (current: PaginatedTasks | undefined) => {
      if (!current || !isPaginatedTaskData(current)) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((task) => (task.id === taskId ? updater(task) : task)),
      };
    },
  );

  queryClient.setQueriesData(
    { queryKey: ["projects", projectId, "board"] },
    (current: TaskRecord[] | undefined) => {
      if (!Array.isArray(current)) {
        return current;
      }

      return current.map((task) => (task.id === taskId ? updater(task) : task));
    },
  );

  queryClient.setQueryData(queryKeys.tasks.detail(taskId), (current: TaskRecord | undefined) =>
    current ? updater(current) : current,
  );
}

export function syncTaskAfterMutation(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  task: TaskRecord,
) {
  updateTaskInProjectTaskCaches(queryClient, projectId, task.id, () => task);
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.taskSummary(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
}

export function useProjectTasksQuery(projectId: string, filters: TaskListFilters) {
  return useQuery({
    queryKey: queryKeys.projects.taskList(projectId, filters),
    queryFn: () => getProjectTasks(projectId, filters),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}

export function useProjectBoardQuery(projectId: string, filters: TaskBoardFilters) {
  return useQuery({
    queryKey: queryKeys.projects.board(projectId, filters),
    queryFn: () => getProjectBoardTasks(projectId, filters),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}

export function useTaskDetailQuery(taskId?: string | null) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId ?? ""),
    queryFn: () => getTask(taskId as string),
    enabled: Boolean(taskId),
  });
}

export function useTaskCommentsQuery(taskId?: string | null) {
  return useQuery({
    queryKey: queryKeys.tasks.comments(taskId ?? ""),
    queryFn: () => getTaskComments(taskId as string),
    enabled: Boolean(taskId),
  });
}

export function useTaskActivitiesQuery(
  taskId?: string | null,
  filters: ActivityListFilters = { page: 1, pageSize: 20 },
) {
  return useQuery({
    queryKey: queryKeys.tasks.activities(taskId ?? "", filters),
    queryFn: () => getTaskActivities(taskId as string, filters),
    enabled: Boolean(taskId),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(projectId, input),
    onSuccess: (task) => {
      syncTaskAfterMutation(queryClient, projectId, task);
      invalidateProjectTaskData(queryClient, projectId, task.id);
    },
  });
}

export function useUpdateTaskMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(taskId, input),
    onSuccess: (task) => {
      syncTaskAfterMutation(queryClient, projectId, task);
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}

export function useUpdateTaskStatusMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TaskStatus) => updateTaskStatus(taskId, status),
    onSuccess: (task) => {
      syncTaskAfterMutation(queryClient, projectId, task);
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}

export function useUpdateTaskPriorityMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priority: TaskPriority) => updateTaskPriority(taskId, priority),
    onSuccess: (task) => {
      syncTaskAfterMutation(queryClient, projectId, task);
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}

export function useUpdateTaskAssigneeMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assigneeId: string | null) => updateTaskAssignee(taskId, assigneeId),
    onSuccess: (task) => {
      syncTaskAfterMutation(queryClient, projectId, task);
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}

export function useCreateTaskCommentMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createTaskComment(taskId, input),
    onSuccess: (comment) => {
      queryClient.setQueryData(queryKeys.tasks.comments(taskId), (current: TaskCommentRecord[] | undefined) =>
        current ? [...current, comment] : [comment],
      );
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}

export function useUpdateTaskCommentMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, input }: { commentId: string; input: UpdateCommentInput }) =>
      updateTaskComment(commentId, input),
    onSuccess: (comment) => {
      queryClient.setQueryData(queryKeys.tasks.comments(taskId), (current: TaskCommentRecord[] | undefined) =>
        current ? current.map((item) => (item.id === comment.id ? comment : item)) : [comment],
      );
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}

export function useDeleteTaskCommentMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteTaskComment(commentId),
    onSuccess: (_result, commentId) => {
      queryClient.setQueryData(queryKeys.tasks.comments(taskId), (current: TaskCommentRecord[] | undefined) =>
        current ? current.filter((item) => item.id !== commentId) : current,
      );
      invalidateTaskCollaborationData(queryClient, taskId);
    },
  });
}
