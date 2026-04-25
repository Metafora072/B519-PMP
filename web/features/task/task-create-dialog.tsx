"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/features/task/constants";
import { useCreateTaskMutation } from "@/features/task/queries";
import { fromDateTimeLocalValue } from "@/lib/format";

import type { ProjectMember, ProjectModule, TaskPriority, TaskStatus } from "@/services/types";

type TaskCreateDialogProps = {
  open: boolean;
  projectId: string;
  modules: ProjectModule[];
  members: ProjectMember[];
  defaultStatus?: TaskStatus;
  onClose: () => void;
};

type TaskCreateFormState = {
  title: string;
  description: string;
  moduleId: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  dueAt: string;
};

function buildInitialState(modules: ProjectModule[], defaultStatus: TaskStatus): TaskCreateFormState {
  return {
    title: "",
    description: "",
    moduleId: modules[0]?.id ?? "",
    priority: "P2",
    status: defaultStatus,
    assigneeId: "",
    dueAt: "",
  };
}

export function TaskCreateDialog({
  open,
  projectId,
  modules,
  members,
  defaultStatus = "TODO",
  onClose,
}: TaskCreateDialogProps) {
  const createTaskMutation = useCreateTaskMutation(projectId);
  const activeMembers = members.filter((member) => member.status === "ACTIVE");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<TaskCreateFormState>(() => buildInitialState(modules, defaultStatus));
  const dialogState = useMemo(() => buildInitialState(modules, defaultStatus), [defaultStatus, modules]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(dialogState);
    setErrorMessage("");
  }, [dialogState, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await createTaskMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        moduleId: formData.moduleId || undefined,
        priority: formData.priority,
        status: formData.status,
        assigneeId: formData.assigneeId || undefined,
        dueAt: fromDateTimeLocalValue(formData.dueAt),
      });

      setFormData(dialogState);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "创建任务失败");
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-[#e6eaf2] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#8b95a7]">新建任务</p>
            <h3 className="mt-1 text-2xl font-semibold text-[#1f2329]">快速补一张可推进的任务卡片</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f2329]">标题</label>
              <Input
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="例如：补齐看板拖拽与状态回滚"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f2329]">描述</label>
              <Textarea
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="补充任务背景、验收口径和上下游依赖"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1f2329]">负责人</label>
                <Select
                  value={formData.assigneeId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, assigneeId: event.target.value }))}
                >
                  <option value="">暂不分配</option>
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1f2329]">模块</label>
                <Select
                  value={formData.moduleId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, moduleId: event.target.value }))}
                >
                  <option value="">未分类</option>
                  {modules.map((moduleItem) => (
                    <option key={moduleItem.id} value={moduleItem.id}>
                      {moduleItem.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1f2329]">状态</label>
                <Select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, status: event.target.value as TaskStatus }))
                  }
                >
                  {TASK_STATUS_OPTIONS.filter((item) => item.value !== "CLOSED").map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1f2329]">优先级</label>
                <Select
                  value={formData.priority}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
                  }
                >
                  {TASK_PRIORITY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f2329]">截止时间</label>
              <Input
                type="datetime-local"
                value={formData.dueAt}
                onChange={(event) => setFormData((prev) => ({ ...prev, dueAt: event.target.value }))}
              />
            </div>

            {errorMessage ? <p className="text-sm text-[#d83931]">{errorMessage}</p> : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "创建中..." : "创建任务"}
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
