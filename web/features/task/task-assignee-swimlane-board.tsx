"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { MemberChip } from "@/features/member/member-chip";
import { TaskBoardCard, TaskBoardCardOverlay } from "@/features/task/task-board-card";
import { BOARD_STATUS_META, BOARD_STATUS_ORDER } from "@/features/task/utils/group-tasks-by-status";
import { cn } from "@/lib/utils";

import type { ProjectMember, TaskRecord, TaskStatus } from "@/services/types";

type BoardStatus = (typeof BOARD_STATUS_ORDER)[number];

type SwimlaneBoardProps = {
  tasks: TaskRecord[];
  members: ProjectMember[];
  onOpenTask: (task: TaskRecord) => void;
  onCreateTask: (status?: TaskStatus) => void;
  onMoveTask: (task: TaskRecord, nextStatus: TaskStatus) => Promise<void>;
};

function resolveStatusFromOverId(
  overId: UniqueIdentifier | null | undefined,
  tasks: TaskRecord[],
): TaskStatus | null {
  if (!overId) {
    return null;
  }

  const rawId = String(overId);

  if (rawId.startsWith("cell-")) {
    return rawId.split("-").pop() as TaskStatus;
  }

  return tasks.find((task) => task.id === rawId)?.status ?? null;
}

function SwimlaneCell({
  laneKey,
  status,
  tasks,
  isDropTarget,
  onOpenTask,
}: {
  laneKey: string;
  status: TaskStatus;
  tasks: TaskRecord[];
  isDropTarget: boolean;
  onOpenTask: (task: TaskRecord) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${laneKey}-${status}`,
    data: { laneKey, status },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[170px] rounded-[24px] border border-[#e4e9f1] bg-[#f8fafc] p-3 transition",
        (isDropTarget || isOver) && "border-[#bfd2ff] bg-[#edf4ff]",
      )}
    >
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskBoardCard key={task.id} task={task} onOpenTask={onOpenTask} />
          ))}
          {!tasks.length ? (
            <div
              className={cn(
                "flex min-h-[120px] items-center justify-center rounded-[18px] border border-dashed px-3 text-center text-sm",
                isDropTarget || isOver
                  ? "border-[#9cb8ff] bg-white/80 text-[#3370ff]"
                  : "border-[#d7dde8] bg-white/70 text-[#8b95a7]",
              )}
            >
              {isDropTarget || isOver ? "松开后移动到这里" : "当前泳道暂无任务"}
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskAssigneeSwimlaneBoard({
  tasks,
  members,
  onOpenTask,
  onCreateTask,
  onMoveTask,
}: SwimlaneBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  const swimlanes = useMemo(() => {
    const orderedMembers = [
      {
        key: "unassigned",
        label: "未分配",
        avatarUrl: null,
        memberId: null,
      },
      ...members.map((member) => ({
        key: member.user.id,
        label: member.user.name,
        avatarUrl: member.user.avatarUrl,
        memberId: member.user.id,
      })),
    ];

    return orderedMembers.map((lane) => ({
      ...lane,
      tasksByStatus: BOARD_STATUS_ORDER.reduce<Record<BoardStatus, TaskRecord[]>>(
        (acc, status) => {
          acc[status] = tasks.filter(
            (task) =>
              (lane.memberId ? task.assignee?.id === lane.memberId : !task.assignee?.id) &&
              task.status === status,
          );
          return acc;
        },
        {} as Record<BoardStatus, TaskRecord[]>,
      ),
    }));
  }, [members, tasks]);

  async function handleDragEnd(event: DragEndEvent) {
    const task = tasks.find((item) => item.id === String(event.active.id));
    const nextStatus = resolveStatusFromOverId(event.over?.id, tasks);

    setActiveTaskId(null);
    setOverStatus(null);

    if (!task || !nextStatus || task.status === nextStatus) {
      return;
    }

    await onMoveTask(task, nextStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event: DragStartEvent) => setActiveTaskId(String(event.active.id))}
      onDragOver={(event) => setOverStatus(resolveStatusFromOverId(event.over?.id, tasks))}
      onDragCancel={() => {
        setActiveTaskId(null);
        setOverStatus(null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[1180px] space-y-4">
          <div className="grid grid-cols-[220px_repeat(3,minmax(280px,1fr))] gap-4">
            <div />
            {BOARD_STATUS_ORDER.map((status) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-[22px] border border-[#e6ebf2] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(31,35,41,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("h-2.5 w-2.5 rounded-full", BOARD_STATUS_META[status].accent)} />
                  <div>
                    <p className="text-sm font-semibold text-[#1f2329]">{BOARD_STATUS_META[status].label}</p>
                    <p className="text-xs text-[#8b95a7]">
                      {tasks.filter((task) => task.status === status).length} 个任务
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => onCreateTask(status)}>
                  <Plus className="mr-1 h-4 w-4" />
                  新建
                </Button>
              </div>
            ))}
          </div>

          {swimlanes.map((lane) => (
            <div
              key={lane.key}
              className="grid grid-cols-[220px_repeat(3,minmax(280px,1fr))] items-start gap-4"
            >
              <div className="sticky left-0 top-0 rounded-[24px] border border-[#e6ebf2] bg-white p-4 shadow-[0_8px_20px_rgba(31,35,41,0.05)]">
                <MemberChip
                  memberKey={lane.key}
                  name={lane.label}
                  avatarUrl={lane.avatarUrl}
                  compact
                  meta={`${Object.values(lane.tasksByStatus).flat().length} 个任务`}
                />
              </div>

              {BOARD_STATUS_ORDER.map((status) => (
                <SwimlaneCell
                  key={`${lane.key}-${status}`}
                  laneKey={lane.key}
                  status={status}
                  tasks={lane.tasksByStatus[status]}
                  isDropTarget={Boolean(activeTask && overStatus === status && activeTask.status !== status)}
                  onOpenTask={onOpenTask}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>{activeTask ? <TaskBoardCardOverlay task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
