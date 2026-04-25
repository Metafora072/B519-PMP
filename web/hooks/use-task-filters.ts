"use client";

import { useMemo, useState } from "react";

import { useDebouncedValue } from "./use-debounced-value";

import type { TaskListFilters } from "@/services/types";

const DEFAULT_PAGE_SIZE = 10;

export function useTaskFilters() {
  const [filters, setFilters] = useState<TaskListFilters>({
    groupBy: "assignee",
    viewMode: "list",
    includeUnassigned: true,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    keyword: "",
  });

  const debouncedKeyword = useDebouncedValue(filters.keyword ?? "");

  const queryFilters = useMemo(
    () => ({
      ...filters,
      keyword: debouncedKeyword || undefined,
    }),
    [debouncedKeyword, filters],
  );

  function updateFilter<K extends keyof TaskListFilters>(key: K, value: TaskListFilters[K]) {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: key === "page" ? value as number : 1,
    }));
  }

  function resetFilters() {
    setFilters({
      groupBy: "assignee",
      viewMode: "list",
      includeUnassigned: true,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      keyword: "",
    });
  }

  return {
    filters,
    queryFilters,
    updateFilter,
    resetFilters,
  };
}
