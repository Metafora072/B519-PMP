import { apiRequest } from "@/lib/api";

import type { ActivityListFilters, PaginatedActivities } from "./types";

export function getTaskActivities(taskId: string, filters: ActivityListFilters) {
  return apiRequest<PaginatedActivities, undefined, ActivityListFilters>(`/api/tasks/${taskId}/activities`, {
    query: filters,
  });
}

export function getProjectActivities(projectId: string, filters: ActivityListFilters) {
  return apiRequest<PaginatedActivities, undefined, ActivityListFilters>(`/api/projects/${projectId}/activities`, {
    query: filters,
  });
}
