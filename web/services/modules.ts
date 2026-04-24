import { apiRequest } from "@/lib/api";

import type { ProjectModule } from "./types";

export function getProjectModules(projectId: string) {
  return apiRequest<ProjectModule[]>(`/api/projects/${projectId}/modules`);
}
