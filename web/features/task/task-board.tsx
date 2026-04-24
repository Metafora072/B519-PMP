"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";

import { TaskBoardCardOverlay } from "@/features/task/task-board-card";
import { TaskBoardColumn } from "@/features/task/task-board-column";
import {
  BOARD_STATUS_META,
  BOARD_STATUS_ORDER,
  groupTasksByStatus,
} from "@/features/task/utils/group-tasks-by-status";

import type { TaskRecord, TaskStatus } from "@/services/types";

type TaskBoardProps = {
  tasks: TaskRecord[];
  onOpenTask: (task: TaskRecord) => void;
  onCreateTask: (status: TaskStatus) => void;
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

  if (rawId.startsWith("column-")) {
    return rawId.replace("column-", "") as TaskStatus;
  }

  return tasks.find((task) => task.id === rawId)?.status ?? null;
}

export function TaskBoard({ tasks, onOpenTask, onCreateTask, onMoveTask }: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragMove(overId: UniqueIdentifier | null | undefined) {
    setOverStatus(resolveStatusFromOverId(overId, tasks));
  }

  function resetDragState() {
    setActiveTaskId(null);
    setOverStatus(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const task = tasks.find((item) => item.id === String(event.active.id));
    const nextStatus = resolveStatusFromOverId(event.over?.id, tasks);

    resetDragState();

    if (!task || !nextStatus || task.status === nextStatus) {
      return;
    }

    await onMoveTask(task, nextStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={(event) => handleDragMove(event.over?.id)}
      onDragCancel={resetDragState}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-fit gap-4">
          {BOARD_STATUS_ORDER.map((status) => (
            <TaskBoardColumn
              key={status}
              status={status}
              title={BOARD_STATUS_META[status].label}
              accentClassName={BOARD_STATUS_META[status].accent}
              tasks={groupedTasks[status]}
              isDropTarget={Boolean(activeTask && overStatus === status && activeTask.status !== status)}
              onOpenTask={onOpenTask}
              onCreateTask={onCreateTask}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskBoardCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
