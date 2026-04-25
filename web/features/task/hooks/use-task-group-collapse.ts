"use client";

import { useCallback, useState } from "react";

export function useTaskGroupCollapse() {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const isCollapsed = useCallback(
    (groupKey: string) => Boolean(collapsedGroups[groupKey]),
    [collapsedGroups],
  );

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  }, []);

  return {
    isCollapsed,
    toggleGroup,
  };
}
