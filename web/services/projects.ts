import { apiRequest } from "@/lib/api";

import type {
  CreateProjectInput,
  ProjectDetail,
  ProjectMember,
  ProjectMemberWorkload,
  ProjectSummary,
  InviteProjectMemberInput,
  UpdateProjectMemberRoleInput,
} from "./types";

export function getProjects() {
  return apiRequest<ProjectSummary[]>("/api/projects");
}

export function getDiscoverableProjects() {
  return apiRequest<ProjectSummary[]>("/api/projects/discoverable");
}

export function createProject(input: CreateProjectInput) {
  return apiRequest<ProjectSummary, CreateProjectInput>("/api/projects", {
    method: "POST",
    body: input,
  });
}

export function getProject(projectId: string) {
  return apiRequest<ProjectDetail>(`/api/projects/${projectId}`);
}

export function getProjectMembers(projectId: string) {
  return apiRequest<ProjectMember[]>(`/api/projects/${projectId}/members`);
}

export function getProjectMemberWorkloads(projectId: string) {
  return apiRequest<ProjectMemberWorkload[]>(`/api/projects/${projectId}/member-workloads`);
}

export function joinProject(projectId: string) {
  return apiRequest<{ result: "joined" | "pending"; membership: ProjectMember }>(`/api/projects/${projectId}/join`, {
    method: "POST",
  });
}

export function inviteProjectMember(projectId: string, input: InviteProjectMemberInput) {
  return apiRequest<ProjectMember, InviteProjectMemberInput>(`/api/projects/${projectId}/invitations`, {
    method: "POST",
    body: input,
  });
}

export function approveProjectMember(projectId: string, memberId: string) {
  return apiRequest<ProjectMember>(`/api/projects/${projectId}/members/${memberId}/approve`, {
    method: "POST",
  });
}

export function rejectProjectMember(projectId: string, memberId: string) {
  return apiRequest<{ message: string }>(`/api/projects/${projectId}/members/${memberId}/reject`, {
    method: "POST",
  });
}

export function removeProjectMember(projectId: string, memberId: string) {
  return apiRequest<{ message: string }>(`/api/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export function updateProjectMemberRole(
  projectId: string,
  memberId: string,
  input: UpdateProjectMemberRoleInput,
) {
  return apiRequest<ProjectMember, UpdateProjectMemberRoleInput>(
    `/api/projects/${projectId}/members/${memberId}/role`,
    {
      method: "PATCH",
      body: input,
    },
  );
}
