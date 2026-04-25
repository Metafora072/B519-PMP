"use client";

import { Clock3, FolderKanban, GripVertical, UserRound } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/features/member/member-avatar";
import { TaskPriorityBadge } from "@/features/task/constants";
import { formatDate, formatRelativeUpdate } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { TaskRecord } from "@/services/types";

type TaskBoardCardBaseProps = {
  task: TaskRecord;
  onOpenTask?: (task: TaskRecord) => void;
  isDragging?: boolean;
  overlay?: boolean;
};

function TaskBoardCardBase({ task, onOpenTask, isDragging, overlay }: TaskBoardCardBaseProps) {
  return (
    <button
      type="button"
      onClick={onOpenTask ? () => onOpenTask(task) : undefined}
      className={cn(
        "w-full rounded-[22px] border border-[#e8edf4] bg-white p-4 text-left shadow-[0_8px_20px_rgba(31,35,41,0.06)] transition duration-200",
        overlay
          ? "rotate-[1.5deg] shadow-[0_20px_40px_rgba(31,35,41,0.16)]"
          : "hover:-translate-y-0.5 hover:border-[#d8e4ff] hover:shadow-[0_14px_28px_rgba(51,112,255,0.12)]",
        isDragging && "shadow-[0_18px_36px_rgba(31,35,41,0.14)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-6 text-[#1f2329]">{task.title}</p>
          <p className="mt-1 text-xs text-[#8b95a7]">{task.taskNo}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f6f8fc] text-[#8b95a7]">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={task.module ? "secondary" : "outline"} className="gap-1.5">
          <FolderKanban className="h-3.5 w-3.5" />
          {task.module?.name ?? "未分类"}
        </Badge>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <div className="mt-4 grid gap-3 text-xs text-[#646a73]">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5 text-[#8b95a7]" />
            {task.assignee ? task.assignee.name : "未分配负责人"}
          </span>
          {!task.assignee ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f3f5] text-[11px] font-semibold text-[#646a73]">
              ?
            </span>
          ) : (
            <MemberAvatar
              memberKey={task.assignee.id}
              name={task.assignee.name}
              avatarUrl={task.assignee.avatarUrl}
              size="sm"
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-[#8b95a7]" />
            截止：{formatDate(task.dueAt)}
          </span>
          <span>{formatRelativeUpdate(task.updatedAt)}</span>
        </div>
      </div>
    </button>
  );
}

type TaskBoardCardProps = {
  task: TaskRecord;
  onOpenTask: (task: TaskRecord) => void;
};

export function TaskBoardCard({ task, onOpenTask }: TaskBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "task",
      taskId: task.id,
      status: task.status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "opacity-35")}
      {...attributes}
      {...listeners}
    >
      <TaskBoardCardBase task={task} onOpenTask={onOpenTask} isDragging={isDragging} />
    </div>
  );
}

export function TaskBoardCardOverlay({ task }: { task: TaskRecord }) {
  return <TaskBoardCardBase task={task} overlay isDragging />;
}
