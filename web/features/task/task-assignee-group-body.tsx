"use client";

import { TaskRowItem } from "@/features/task/task-row-item";
import { cn } from "@/lib/utils";

import type { TaskRecord } from "@/services/types";

type TaskAssigneeGroupBodyProps = {
  collapsed: boolean;
  tasks: TaskRecord[];
  onOpenTask: (task: TaskRecord) => void;
};

export function TaskAssigneeGroupBody({
  collapsed,
  tasks,
  onOpenTask,
}: TaskAssigneeGroupBodyProps) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
        collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
      )}
    >
      <div className="overflow-hidden">
        <div className="bg-white">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskRowItem key={task.id} task={task} onOpenTask={onOpenTask} />
            ))
          ) : (
            <div className="border-t border-[#eef1f6] px-5 py-8 text-sm text-[#8b95a7]">
              暂无任务
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
