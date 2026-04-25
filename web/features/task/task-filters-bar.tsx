"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/features/task/constants";

import type { ProjectMember, ProjectModule, TaskListFilters } from "@/services/types";

type TaskFiltersBarProps = {
  filters: TaskListFilters;
  members: ProjectMember[];
  modules: ProjectModule[];
  onFilterChange: <K extends keyof TaskListFilters>(key: K, value: TaskListFilters[K]) => void;
  onReset: () => void;
};

export function TaskFiltersBar({
  filters,
  members,
  modules,
  onFilterChange,
  onReset,
}: TaskFiltersBarProps) {
  return (
    <div className="rounded-[28px] border border-[#e8edf4] bg-white p-5 shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
      <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a7]" />
          <Input
            className="pl-10"
            placeholder="搜索任务标题、描述、编号"
            value={filters.keyword ?? ""}
            onChange={(event) => onFilterChange("keyword", event.target.value)}
          />
        </div>

        <Select
          value={filters.status ?? ""}
          onChange={(event) => onFilterChange("status", (event.target.value || undefined) as TaskListFilters["status"])}
        >
          <option value="">全部状态</option>
          {TASK_STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Select
          value={filters.priority ?? ""}
          onChange={(event) =>
            onFilterChange("priority", (event.target.value || undefined) as TaskListFilters["priority"])
          }
        >
          <option value="">全部优先级</option>
          {TASK_PRIORITY_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Select
          value={filters.moduleId ?? ""}
          onChange={(event) => onFilterChange("moduleId", event.target.value || undefined)}
        >
          <option value="">全部模块</option>
          <option value="none">未分类</option>
          {modules.map((moduleItem) => (
            <option key={moduleItem.id} value={moduleItem.id}>
              {moduleItem.name}
            </option>
          ))}
        </Select>

        <Select
          value={filters.assigneeId ?? ""}
          onChange={(event) => onFilterChange("assigneeId", event.target.value || undefined)}
        >
          <option value="">全部负责人</option>
          <option value="none">未分配</option>
          {members.map((member) => (
            <option key={member.id} value={member.user.id}>
              {member.user.name}
            </option>
          ))}
        </Select>

        <Button variant="outline" onClick={onReset}>
          <X className="mr-2 h-4 w-4" />
          重置
        </Button>
      </div>
    </div>
  );
}
