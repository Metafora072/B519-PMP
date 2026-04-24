import { apiRequest } from "@/lib/api";

import type { CreateModuleInput, ProjectModule } from "./types";

export function getProjectModules(projectId: string) {
  return apiRequest<ProjectModule[]>(`/api/projects/${projectId}/modules`);
}

export function createModule(projectId: string, input: CreateModuleInput) {
  return apiRequest<ProjectModule, CreateModuleInput>(`/api/projects/${projectId}/modules`, {
    method: "POST",
    body: input,
  });
}
