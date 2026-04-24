"use client";

import { Plus } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { TaskBoardCard } from "@/features/task/task-board-card";
import { cn } from "@/lib/utils";

import type { TaskRecord, TaskStatus } from "@/services/types";

type TaskBoardColumnProps = {
  status: TaskStatus;
  title: string;
  accentClassName: string;
  tasks: TaskRecord[];
  isDropTarget: boolean;
  onOpenTask: (task: TaskRecord) => void;
  onCreateTask: (status: TaskStatus) => void;
};

export function TaskBoardColumn({
  status,
  title,
  accentClassName,
  tasks,
  isDropTarget,
  onOpenTask,
  onCreateTask,
}: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      status,
    },
  });

  const showPlaceholder = (isDropTarget || isOver) && tasks.length > 0;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[320px] shrink-0 flex-col rounded-[28px] border border-[#e6ebf2] bg-[#eef2f7] p-4 transition",
        (isDropTarget || isOver) && "border-[#bfd2ff] bg-[#e8f0ff] shadow-[inset_0_0_0_1px_rgba(51,112,255,0.06)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full", accentClassName)} />
          <div>
            <h3 className="text-sm font-semibold text-[#1f2329]">{title}</h3>
            <p className="text-xs text-[#8b95a7]">{tasks.length} 个任务</p>
          </div>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={() => onCreateTask(status)}>
          <Plus className="mr-1 h-4 w-4" />
          新建
        </Button>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskBoardCard key={task.id} task={task} onOpenTask={onOpenTask} />
          ))}
        </SortableContext>

        {showPlaceholder ? (
          <div className="rounded-[20px] border border-dashed border-[#9cb8ff] bg-white/70 px-4 py-5 text-sm text-[#3370ff]">
            松开后移动到 {title}
          </div>
        ) : null}

        {!tasks.length ? (
          <div
            className={cn(
              "flex min-h-[180px] items-center justify-center rounded-[22px] border border-dashed px-4 text-center text-sm leading-7",
              isDropTarget || isOver
                ? "border-[#9cb8ff] bg-white/70 text-[#3370ff]"
                : "border-[#d7dde8] bg-[#f7f9fc] text-[#8b95a7]",
            )}
          >
            {isDropTarget || isOver ? `松开后移动到 ${title}` : "当前列还没有任务，点击右上角先创建一张卡片。"}
          </div>
        ) : null}
      </div>
    </section>
  );
}
