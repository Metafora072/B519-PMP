"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProjectActivities } from "@/services/activities";
import { createModule, getProjectModules } from "@/services/modules";
import { getProjectTaskSummary } from "@/services/tasks";
import { queryKeys } from "@/services/query-keys";
import { createProject, getProject, getProjectMembers, getProjects } from "@/services/projects";

import type { ActivityListFilters, CreateModuleInput, CreateProjectInput } from "@/services/types";

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjects,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectMembersQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectModulesQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.modules(projectId),
    queryFn: () => getProjectModules(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectActivitiesQuery(
  projectId: string,
  filters: ActivityListFilters = { page: 1, pageSize: 12 },
) {
  return useQuery({
    queryKey: queryKeys.projects.activities(projectId, filters),
    queryFn: () => getProjectActivities(projectId, filters),
    enabled: Boolean(projectId),
  });
}

export function useCreateModuleMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateModuleInput) => createModule(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.modules(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useProjectTaskSummaryQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.taskSummary(projectId),
    queryFn: () => getProjectTaskSummary(projectId),
    enabled: Boolean(projectId),
  });
}
