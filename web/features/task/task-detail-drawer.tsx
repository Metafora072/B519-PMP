"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FolderKanban, UserRound, X } from "lucide-react";

import { TaskActivityTimeline } from "@/features/task/task-activity-timeline";
import { AssigneeBadge } from "@/features/member/assignee-badge";
import { Button } from "@/components/ui/button";
import { TaskCommentsSection } from "@/features/task/task-comments-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TaskPriorityBadge,
  TaskStatusBadge,
} from "@/features/task/constants";
import {
  useTaskDetailQuery,
  useUpdateTaskAssigneeMutation,
  useUpdateTaskMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskStatusMutation,
} from "@/features/task/queries";
import { fromDateTimeLocalValue, formatDateTime, toDateTimeLocalValue } from "@/lib/format";
import { getCurrentUser } from "@/services/auth";
import { queryKeys } from "@/services/query-keys";
import { useTaskDrawerStore } from "@/store/task-drawer-store";

import type {
  ProjectMember,
  ProjectModule,
  TaskPriority,
  TaskStatus,
} from "@/services/types";

type TaskDetailDrawerProps = {
  members: ProjectMember[];
  modules: ProjectModule[];
};

export function TaskDetailDrawer({ members, modules }: TaskDetailDrawerProps) {
  const { closeDrawer, isOpen, projectId, taskId } = useTaskDrawerStore();
  const taskQuery = useTaskDetailQuery(taskId);
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updateTaskMutation = useUpdateTaskMutation(projectId ?? "", taskId ?? "");
  const updateStatusMutation = useUpdateTaskStatusMutation(projectId ?? "", taskId ?? "");
  const updatePriorityMutation = useUpdateTaskPriorityMutation(projectId ?? "", taskId ?? "");
  const updateAssigneeMutation = useUpdateTaskAssigneeMutation(projectId ?? "", taskId ?? "");
  const activeMembers = members.filter((member) => member.status === "ACTIVE");

  useEffect(() => {
    if (!taskQuery.data) {
      return;
    }

    setTitle(taskQuery.data.title);
    setDescription(taskQuery.data.description ?? "");
    setModuleId(taskQuery.data.moduleId ?? "");
    setDueAt(toDateTimeLocalValue(taskQuery.data.dueAt));
    setMessage("");
    setErrorMessage("");
  }, [taskQuery.data]);

  if (!isOpen || !taskId) {
    return null;
  }

  async function handleBaseSave() {
    setMessage("");
    setErrorMessage("");

    try {
      await updateTaskMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        moduleId,
        dueAt: fromDateTimeLocalValue(dueAt),
      });
      setMessage("基础信息已保存");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存失败");
    }
  }

  async function handleStatusChange(nextStatus: string) {
    try {
      setMessage("");
      setErrorMessage("");
      await updateStatusMutation.mutateAsync(nextStatus as TaskStatus);
      setMessage("状态已更新");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "状态更新失败");
    }
  }

  async function handlePriorityChange(nextPriority: string) {
    try {
      setMessage("");
      setErrorMessage("");
      await updatePriorityMutation.mutateAsync(nextPriority as TaskPriority);
      setMessage("优先级已更新");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "优先级更新失败");
    }
  }

  async function handleAssigneeChange(nextAssigneeId: string) {
    try {
      setMessage("");
      setErrorMessage("");
      await updateAssigneeMutation.mutateAsync(nextAssigneeId || null);
      setMessage("负责人已更新");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "负责人更新失败");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#0f172a]/18" onClick={closeDrawer} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto border-l border-[#e8edf4] bg-white shadow-[-24px_0_64px_rgba(15,23,42,0.18)]">
        <div className="sticky top-0 z-10 border-b border-[#eef1f6] bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#8b95a7]">任务详情</p>
              <h3 className="mt-1 text-2xl font-semibold text-[#1f2329]">
                {taskQuery.data?.taskNo ?? "加载中..."}
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={closeDrawer}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {taskQuery.isLoading ? (
            <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm text-[#8b95a7]">
              正在加载任务详情...
            </div>
          ) : taskQuery.isError || !taskQuery.data ? (
            <div className="rounded-[24px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
              {taskQuery.error?.message ?? "任务详情加载失败"}
            </div>
          ) : (
            <>
              <div className="rounded-[24px] border border-[#e8edf4] bg-[#fbfcff] p-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-[22px] font-semibold text-[#1f2329]">{taskQuery.data.title}</p>
                    <p className="mt-1 text-sm text-[#8b95a7]">{taskQuery.data.taskNo}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AssigneeBadge
                      id={taskQuery.data.assignee?.id ?? null}
                      name={taskQuery.data.assignee?.name ?? null}
                      avatarUrl={taskQuery.data.assignee?.avatarUrl}
                      emphasizeUnassigned
                    />
                    <TaskStatusBadge status={taskQuery.data.status} />
                    <TaskPriorityBadge priority={taskQuery.data.priority} />
                    <span className="rounded-full border border-[#e7ebf3] bg-white px-3 py-1.5 text-sm text-[#4e5969]">
                      模块 · {taskQuery.data.module?.name ?? "未分类"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm leading-7 text-[#646a73]">
                      最近更新时间：{formatDateTime(taskQuery.data.updatedAt)}
                    </p>
                    {currentUserQuery.data && taskQuery.data.assignee?.id !== currentUserQuery.data.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleAssigneeChange(currentUserQuery.data?.id ?? "")}
                      >
                        快速分配给我
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[24px] border border-[#e8edf4] bg-white p-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1f2329]">标题</label>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1f2329]">描述</label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="补充任务背景、验收标准或执行备注"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1f2329]">模块</label>
                  <Select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>
                    <option value="">未分类</option>
                    {modules.map((moduleItem) => (
                      <option key={moduleItem.id} value={moduleItem.id}>
                        {moduleItem.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1f2329]">截止时间</label>
                  <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
                </div>

                <Button
                  className="w-full"
                  onClick={handleBaseSave}
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? "保存中..." : "保存基础信息"}
                </Button>
              </div>

              <div className="space-y-4 rounded-[24px] border border-[#e8edf4] bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1f2329]">
                  <CalendarClock className="h-4 w-4 text-[#3370ff]" />
                  状态与协作字段
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#4e5969]">状态</label>
                  <Select
                    value={taskQuery.data.status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {TASK_STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#4e5969]">优先级</label>
                  <Select
                    value={taskQuery.data.priority}
                    onChange={(event) => handlePriorityChange(event.target.value)}
                    disabled={updatePriorityMutation.isPending}
                  >
                    {TASK_PRIORITY_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#4e5969]">负责人</label>
                  <Select
                    value={taskQuery.data.assigneeId ?? ""}
                    onChange={(event) => handleAssigneeChange(event.target.value)}
                    disabled={updateAssigneeMutation.isPending}
                  >
                    <option value="">暂不分配</option>
                    {activeMembers.map((member) => (
                      <option key={member.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#e8edf4] bg-[#fbfcff] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#8b95a7]">
                    <UserRound className="h-4 w-4" />
                    负责人
                  </div>
                  <div className="mt-2">
                    <AssigneeBadge
                      id={taskQuery.data.assignee?.id ?? null}
                      name={taskQuery.data.assignee?.name ?? null}
                      avatarUrl={taskQuery.data.assignee?.avatarUrl}
                      emphasizeUnassigned
                    />
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#e8edf4] bg-[#fbfcff] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#8b95a7]">
                    <FolderKanban className="h-4 w-4" />
                    当前模块
                  </div>
                  <p className="mt-2 font-medium text-[#1f2329]">{taskQuery.data.module?.name ?? "未分类"}</p>
                </div>
              </div>

              {message ? <p className="text-sm text-[#00a870]">{message}</p> : null}
              {errorMessage ? <p className="text-sm text-[#d83931]">{errorMessage}</p> : null}

              <TaskCommentsSection taskId={taskId} members={activeMembers} />
              <TaskActivityTimeline taskId={taskId} />
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
