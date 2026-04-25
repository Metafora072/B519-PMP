"use client";

import { AlertCircle, Flame } from "lucide-react";

import { AssigneeBadge } from "@/features/member/assignee-badge";
import { TaskPriorityBadge, TaskStatusBadge } from "@/features/task/constants";
import { formatDate } from "@/lib/format";

import type { TaskRecord } from "@/services/types";

type TaskAssigneeGroupSectionProps = {
  title: string;
  assignee?: {
    id?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  };
  tasks: TaskRecord[];
  onOpenTask: (task: TaskRecord) => void;
};

export function TaskAssigneeGroupSection({
  title,
  assignee,
  tasks,
  onOpenTask,
}: TaskAssigneeGroupSectionProps) {
  const overdueCount = tasks.filter(
    (task) =>
      task.dueAt &&
      new Date(task.dueAt).getTime() < Date.now() &&
      task.status !== "DONE" &&
      task.status !== "CLOSED",
  ).length;
  const p0Count = tasks.filter((task) => task.priority === "P0").length;

  return (
    <section className="rounded-[28px] border border-[#e8edf4] bg-white shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#eef1f6] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <AssigneeBadge
            id={assignee?.id ?? null}
            name={assignee?.name ?? title}
            avatarUrl={assignee?.avatarUrl}
            emphasizeUnassigned={!assignee?.id}
          />
          <div className="flex items-center gap-2 text-sm text-[#4e5969]">
            <span>{tasks.length} 个任务</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1ef] px-2.5 py-1 text-[#d83931]">
              <AlertCircle className="h-3.5 w-3.5" />
              逾期 {overdueCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6eb] px-2.5 py-1 text-[#b85f00]">
              <Flame className="h-3.5 w-3.5" />
              P0 {p0Count}
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#eef1f6]">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onOpenTask(task)}
            className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-[#f8fbff] md:grid-cols-[minmax(220px,1.4fr)_120px_100px_120px_120px]"
          >
            <div>
              <p className="text-xs text-[#8b95a7]">{task.taskNo}</p>
              <p className="mt-1 font-medium text-[#1f2329]">{task.title}</p>
              <p className="mt-1 line-clamp-1 text-sm text-[#646a73]">{task.description || "暂无描述"}</p>
            </div>
            <div className="flex items-center">
              <TaskStatusBadge status={task.status} />
            </div>
            <div className="flex items-center">
              <TaskPriorityBadge priority={task.priority} />
            </div>
            <div className="flex items-center text-sm text-[#4e5969]">{task.module?.name ?? "未分类"}</div>
            <div className="flex items-center text-sm text-[#4e5969]">截止 {formatDate(task.dueAt)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
