"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/services/query-keys";
import {
  getProjectTasks,
  getTask,
  updateTask,
  updateTaskAssignee,
  updateTaskPriority,
  updateTaskStatus,
} from "@/services/tasks";

import type { TaskListFilters, TaskPriority, TaskStatus, UpdateTaskInput } from "@/services/types";

function invalidateProjectTaskData(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  taskId: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.taskSummary(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
}

export function useProjectTasksQuery(projectId: string, filters: TaskListFilters) {
  return useQuery({
    queryKey: queryKeys.projects.taskList(projectId, filters),
    queryFn: () => getProjectTasks(projectId, filters),
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

export function useUpdateTaskMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(taskId, input),
    onSuccess: () => invalidateProjectTaskData(queryClient, projectId, taskId),
  });
}

export function useUpdateTaskStatusMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TaskStatus) => updateTaskStatus(taskId, status),
    onSuccess: () => invalidateProjectTaskData(queryClient, projectId, taskId),
  });
}

export function useUpdateTaskPriorityMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priority: TaskPriority) => updateTaskPriority(taskId, priority),
    onSuccess: () => invalidateProjectTaskData(queryClient, projectId, taskId),
  });
}

export function useUpdateTaskAssigneeMutation(projectId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assigneeId: string | null) => updateTaskAssignee(taskId, assigneeId),
    onSuccess: () => invalidateProjectTaskData(queryClient, projectId, taskId),
  });
}
