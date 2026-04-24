import { apiRequest } from "@/lib/api";

import type {
  CreateProjectInput,
  ProjectDetail,
  ProjectMember,
  ProjectSummary,
} from "./types";

export function getProjects() {
  return apiRequest<ProjectSummary[]>("/api/projects");
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
