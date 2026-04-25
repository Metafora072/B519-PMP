"use client";

import { TaskAssigneeGroupSection } from "@/features/task/task-assignee-group-section";

import type { PaginatedTasks, TaskRecord } from "@/services/types";

type TaskListGroupedByAssigneeProps = {
  data: PaginatedTasks;
  onOpenTask: (task: TaskRecord) => void;
};

function groupTasksByAssignee(tasks: TaskRecord[]) {
  const grouped = new Map<
    string,
    {
      title: string;
      assignee?: { id?: string | null; name?: string | null; avatarUrl?: string | null };
      tasks: TaskRecord[];
    }
  >();

  for (const task of tasks) {
    const key = task.assignee?.id ?? "unassigned";
    const current = grouped.get(key) ?? {
      title: task.assignee?.name ?? "未分配",
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            avatarUrl: task.assignee.avatarUrl,
          }
        : undefined,
      tasks: [],
    };
    current.tasks.push(task);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries())
    .sort(([leftKey], [rightKey]) => {
      if (leftKey === "unassigned") {
        return -1;
      }

      if (rightKey === "unassigned") {
        return 1;
      }

      return 0;
    })
    .map(([, value]) => value);
}

export function TaskListGroupedByAssignee({
  data,
  onOpenTask,
}: TaskListGroupedByAssigneeProps) {
  const groups = groupTasksByAssignee(data.items);

  return (
    <div className="space-y-4">
      {groups.length > 0 ? (
        groups.map((group) => (
          <TaskAssigneeGroupSection
            key={group.assignee?.id ?? "unassigned"}
            title={group.title}
            assignee={group.assignee}
            tasks={group.tasks}
            onOpenTask={onOpenTask}
          />
        ))
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-8 text-sm text-[#8b95a7]">
          当前筛选条件下没有任务。
        </div>
      )}
    </div>
  );
}
