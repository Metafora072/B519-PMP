import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { TaskPriority, TaskStatus } from "@/services/types";

export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "TODO", label: "待开始" },
  { value: "IN_PROGRESS", label: "进行中" },
  { value: "DONE", label: "已完成" },
  { value: "CLOSED", label: "已关闭" },
];

export const TASK_PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: "P0", label: "P0" },
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
];

export function getTaskStatusLabel(status: TaskStatus) {
  return TASK_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

export function getTaskPriorityLabel(priority: TaskPriority) {
  return TASK_PRIORITY_OPTIONS.find((item) => item.value === priority)?.label ?? priority;
}

function getStatusClassName(status: TaskStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-[#eef5ff] text-[#3370ff]";
    case "DONE":
      return "bg-[#edf8f2] text-[#00a870]";
    case "CLOSED":
      return "bg-[#f2f3f5] text-[#4e5969]";
    default:
      return "bg-[#fff7e8] text-[#ff7d00]";
  }
}

function getPriorityClassName(priority: TaskPriority) {
  switch (priority) {
    case "P0":
      return "bg-[#ffece8] text-[#d83931]";
    case "P1":
      return "bg-[#fff3e8] text-[#ff7d00]";
    case "P2":
      return "bg-[#edf3ff] text-[#3370ff]";
    default:
      return "bg-[#f2f3f5] text-[#4e5969]";
  }
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge className={cn("border-none", getStatusClassName(status), className)}>
      {getTaskStatusLabel(status)}
    </Badge>
  );
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <Badge className={cn("border-none", getPriorityClassName(priority), className)}>
      {getTaskPriorityLabel(priority)}
    </Badge>
  );
}
