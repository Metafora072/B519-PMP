"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ModuleCreateDialog } from "@/features/module/module-create-dialog";
import {
  invalidateProjectTaskData,
  syncTaskAfterMutation,
  useProjectBoardQuery,
} from "@/features/task/queries";
import { TaskAssigneeSwimlaneBoard } from "@/features/task/task-assignee-swimlane-board";
import { TaskBoardToolbar } from "@/features/task/task-board-toolbar";
import { TaskCreateDialog } from "@/features/task/task-create-dialog";
import { TaskDetailDrawer } from "@/features/task/task-detail-drawer";
import { useProjectMembersQuery, useProjectModulesQuery, useProjectQuery } from "@/features/project/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { updateTaskStatus } from "@/services/tasks";
import { useToastStore } from "@/store/toast-store";
import { useTaskDrawerStore } from "@/store/task-drawer-store";

import type { TaskBoardFilters, TaskRecord, TaskStatus } from "@/services/types";

type TaskBoardPageProps = {
  projectId: string;
};

const initialFilters: TaskBoardFilters & { keyword: string } = {
  keyword: "",
};

function patchTaskStatus(tasks: TaskRecord[], taskId: string, status: TaskStatus) {
  return tasks.map((task) => (task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task));
}

export function TaskBoardPage({ projectId }: TaskBoardPageProps) {
  const openDrawer = useTaskDrawerStore((state) => state.openDrawer);
  const pushToast = useToastStore((state) => state.pushToast);
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(initialFilters);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("TODO");
  const debouncedKeyword = useDebouncedValue(filters.keyword, 250);
  const queryFilters = useMemo(
    () => ({
      ...filters,
      keyword: debouncedKeyword || undefined,
    }),
    [debouncedKeyword, filters],
  );

  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const modulesQuery = useProjectModulesQuery(projectId);
  const boardQuery = useProjectBoardQuery(projectId, queryFilters);
  const [boardTasks, setBoardTasks] = useState<TaskRecord[]>([]);

  useEffect(() => {
    setBoardTasks(boardQuery.data ?? []);
  }, [boardQuery.data]);

  const moveStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: (task) => {
      syncTaskAfterMutation(queryClient, projectId, task);
    },
    onSettled: (_data, _error, variables) => {
      invalidateProjectTaskData(queryClient, projectId, variables.taskId);
    },
  });

  const members = (membersQuery.data ?? []).filter((member) => member.status === "ACTIVE");
  const modules = modulesQuery.data ?? [];

  function updateFilter(key: keyof TaskBoardFilters, value: string | undefined) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  function handleOpenTask(task: TaskRecord) {
    openDrawer({ projectId, taskId: task.id });
  }

  function handleOpenCreateDialog(status: TaskStatus = "TODO") {
    setCreateDefaultStatus(status);
    setCreateDialogOpen(true);
  }

  async function handleMoveTask(task: TaskRecord, nextStatus: TaskStatus) {
    const previousStatus = task.status;

    setBoardTasks((current) => patchTaskStatus(current, task.id, nextStatus));

    try {
      await moveStatusMutation.mutateAsync({
        taskId: task.id,
        status: nextStatus,
      });
    } catch (error) {
      setBoardTasks((current) => patchTaskStatus(current, task.id, previousStatus));
      pushToast({
        tone: "error",
        title: "状态同步失败",
        description: error instanceof Error ? error.message : "任务状态回滚，请稍后重试",
      });
    }
  }

  if (projectQuery.isLoading) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-8 text-sm text-[#8b95a7]">
        正在加载项目看板...
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
        {projectQuery.error?.message ?? "项目看板加载失败"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskBoardToolbar
        projectId={projectId}
        projectName={projectQuery.data.name}
        filters={filters}
        modules={modules}
        members={members}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        onCreateTask={handleOpenCreateDialog}
        onCreateModule={() => setCreateModuleOpen(true)}
      />

      {boardQuery.isLoading ? (
        <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-8 text-sm text-[#8b95a7]">
          正在加载看板任务...
        </div>
      ) : boardQuery.isError ? (
        <div className="rounded-[28px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
          {boardQuery.error.message}
        </div>
      ) : boardTasks.length ? (
        <TaskAssigneeSwimlaneBoard
          tasks={boardTasks}
          members={members}
          onOpenTask={handleOpenTask}
          onCreateTask={handleOpenCreateDialog}
          onMoveTask={handleMoveTask}
        />
      ) : (
        <div className="rounded-[30px] border border-dashed border-[#d7dde8] bg-white px-8 py-14 text-center shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
          <p className="text-lg font-medium text-[#1f2329]">
            {debouncedKeyword || filters.assigneeId || filters.moduleId || filters.priority
              ? "当前筛选条件下没有匹配任务"
              : "当前项目还没有任务"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#646a73]">
            {debouncedKeyword || filters.assigneeId || filters.moduleId || filters.priority
              ? "可以重置筛选条件，或者直接新建一张任务卡片。"
              : "先创建一批任务后，再通过看板推进 Todo、In Progress 与 Done 的流转。"}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={resetFilters}>
              重置筛选
            </Button>
            <Button onClick={() => handleOpenCreateDialog("TODO")}>新建任务</Button>
          </div>
        </div>
      )}

      <TaskDetailDrawer members={members} modules={modules} />
      <TaskCreateDialog
        open={createDialogOpen}
        projectId={projectId}
        modules={modules}
        members={members}
        defaultStatus={createDefaultStatus}
        onClose={() => setCreateDialogOpen(false)}
      />
      <ModuleCreateDialog
        open={createModuleOpen}
        projectId={projectId}
        onClose={() => setCreateModuleOpen(false)}
      />
    </div>
  );
}
