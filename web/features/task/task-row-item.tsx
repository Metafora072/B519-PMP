"use client";

import { CalendarDays, Clock3, FolderKanban } from "lucide-react";
import type { ReactNode } from "react";

import { TaskPriorityBadge, TaskStatusBadge } from "@/features/task/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { TaskRecord } from "@/services/types";

type TaskRowItemProps = {
  task: TaskRecord;
  onOpenTask: (task: TaskRecord) => void;
};

function MetaCell({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-sm text-[#4e5969]", className)}>
      <span className="shrink-0 text-[#8b95a7]">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}

export function TaskRowItem({ task, onOpenTask }: TaskRowItemProps) {
  const isOverdue =
    task.dueAt &&
    new Date(task.dueAt).getTime() < Date.now() &&
    task.status !== "DONE" &&
    task.status !== "CLOSED";

  return (
    <button
      type="button"
      onClick={() => onOpenTask(task)}
      className="group grid w-full gap-3 border-t border-[#eef1f6] bg-white px-4 py-4 text-left transition hover:bg-[#f8fbff] sm:px-5 lg:grid-cols-[minmax(260px,1fr)_minmax(420px,auto)] lg:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#f2f5fa] px-2 py-1 text-xs font-medium text-[#667085]">
            {task.taskNo}
          </span>
          <span className="line-clamp-1 text-sm font-semibold text-[#1f2329] group-hover:text-[#245bdb]">
            {task.title}
          </span>
        </div>
        <p className="mt-2 line-clamp-1 text-sm leading-6 text-[#646a73]">
          {task.description || "暂无描述"}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[104px_80px_130px_132px_118px] lg:items-center">
        <div className="flex items-center">
          <TaskStatusBadge status={task.status} className="h-7 px-2.5 text-xs" />
        </div>
        <div className="flex items-center">
          <TaskPriorityBadge priority={task.priority} className="h-7 px-2.5 text-xs" />
        </div>
        <MetaCell icon={<FolderKanban className="h-3.5 w-3.5" />}>{task.module?.name ?? "未分类"}</MetaCell>
        <MetaCell
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          className={isOverdue ? "font-medium text-[#d83931]" : undefined}
        >
          {formatDate(task.dueAt)}
        </MetaCell>
        <MetaCell icon={<Clock3 className="h-3.5 w-3.5" />} className="text-[#8b95a7]">
          {formatDateTime(task.updatedAt)}
        </MetaCell>
      </div>
    </button>
  );
}
