"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProjectActivities } from "@/services/activities";
import { createModule, getProjectModules } from "@/services/modules";
import { getProjectTaskSummary } from "@/services/tasks";
import { queryKeys } from "@/services/query-keys";
import {
  approveProjectMember,
  createProject,
  getDiscoverableProjects,
  getProject,
  getProjectMemberWorkloads,
  getProjectMembers,
  getProjects,
  inviteProjectMember,
  joinProject,
  rejectProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from "@/services/projects";

import type {
  ActivityListFilters,
  CreateModuleInput,
  CreateProjectInput,
  InviteProjectMemberInput,
  UpdateProjectMemberRoleInput,
} from "@/services/types";

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjects,
  });
}

export function useDiscoverableProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects.discoverable,
    queryFn: getDiscoverableProjects,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.discoverable });
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

export function useProjectMemberWorkloadsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.memberWorkloads(projectId),
    queryFn: () => getProjectMemberWorkloads(projectId),
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

function invalidateProjectMembershipData(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.discoverable });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects.memberWorkloads(projectId) });
}

export function useJoinProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinProject(projectId),
    onSuccess: () => {
      invalidateProjectMembershipData(queryClient, projectId);
    },
  });
}

export function useInviteProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteProjectMemberInput) => inviteProjectMember(projectId, input),
    onSuccess: () => {
      invalidateProjectMembershipData(queryClient, projectId);
    },
  });
}

export function useApproveProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => approveProjectMember(projectId, memberId),
    onSuccess: () => {
      invalidateProjectMembershipData(queryClient, projectId);
    },
  });
}

export function useRejectProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => rejectProjectMember(projectId, memberId),
    onSuccess: () => {
      invalidateProjectMembershipData(queryClient, projectId);
    },
  });
}

export function useRemoveProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeProjectMember(projectId, memberId),
    onSuccess: () => {
      invalidateProjectMembershipData(queryClient, projectId);
    },
  });
}

export function useUpdateProjectMemberRoleMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: UpdateProjectMemberRoleInput }) =>
      updateProjectMemberRole(projectId, memberId, input),
    onSuccess: () => {
      invalidateProjectMembershipData(queryClient, projectId);
    },
  });
}
