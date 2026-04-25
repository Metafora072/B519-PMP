import { apiRequest } from "@/lib/api";

import type {
  PendingActionRecord,
  TaskRecord,
  WorkbenchSummary,
  WorkbenchTaskScope,
} from "./types";

export function getWorkbenchSummary() {
  return apiRequest<WorkbenchSummary>("/api/me/workbench/summary");
}

export function getMyTasks(scope: WorkbenchTaskScope) {
  return apiRequest<TaskRecord[], undefined, { scope: WorkbenchTaskScope }>("/api/me/tasks", {
    query: { scope },
  });
}

export function getMyPendingActions() {
  return apiRequest<PendingActionRecord[]>("/api/me/pending-actions");
}
