"use client";

import { TaskAssigneeGroupBody } from "@/features/task/task-assignee-group-body";
import { TaskAssigneeGroupHeader } from "@/features/task/task-assignee-group-header";

import type { TaskRecord } from "@/services/types";

type TaskAssigneeGroupSectionProps = {
  title: string;
  assignee?: {
    id?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  };
  tasks: TaskRecord[];
  collapsed: boolean;
  onToggle: () => void;
  onOpenTask: (task: TaskRecord) => void;
};

export function TaskAssigneeGroupSection({
  title,
  assignee,
  tasks,
  collapsed,
  onToggle,
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
  const p1Count = tasks.filter((task) => task.priority === "P1").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter((task) => task.status === "DONE" || task.status === "CLOSED").length;

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#dfe6f1] bg-white shadow-[0_12px_28px_rgba(31,35,41,0.045)]">
      <TaskAssigneeGroupHeader
        title={title}
        assignee={assignee}
        collapsed={collapsed}
        stats={{
          total: tasks.length,
          overdue: overdueCount,
          p0: p0Count,
          p1: p1Count,
          inProgress: inProgressCount,
          done: doneCount,
        }}
        onToggle={onToggle}
      />
      <TaskAssigneeGroupBody collapsed={collapsed} tasks={tasks} onOpenTask={onOpenTask} />
    </section>
  );
}
