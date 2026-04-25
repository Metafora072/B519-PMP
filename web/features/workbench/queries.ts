"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyPendingActions, getMyTasks, getWorkbenchSummary } from "@/services/me";
import { queryKeys } from "@/services/query-keys";

import type { WorkbenchTaskScope } from "@/services/types";

export function useWorkbenchSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.me.workbenchSummary,
    queryFn: getWorkbenchSummary,
  });
}

export function useMyTasksQuery(scope: WorkbenchTaskScope) {
  return useQuery({
    queryKey: queryKeys.me.tasks(scope),
    queryFn: () => getMyTasks(scope),
  });
}

export function useMyPendingActionsQuery() {
  return useQuery({
    queryKey: queryKeys.me.pendingActions,
    queryFn: getMyPendingActions,
  });
}
