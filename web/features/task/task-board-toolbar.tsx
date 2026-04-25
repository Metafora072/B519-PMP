"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, KanbanSquare, Layers3, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TASK_PRIORITY_OPTIONS } from "@/features/task/constants";
import { ProjectViewTabs } from "@/features/project/project-view-tabs";

import type { ProjectMember, ProjectModule, TaskBoardFilters, TaskStatus } from "@/services/types";

type TaskBoardToolbarProps = {
  projectId: string;
  projectName: string;
  filters: TaskBoardFilters & { keyword: string };
  modules: ProjectModule[];
  members: ProjectMember[];
  onFilterChange: (key: keyof TaskBoardFilters, value: string | undefined) => void;
  onReset: () => void;
  onCreateTask: (status?: TaskStatus) => void;
  onCreateModule: () => void;
  viewSwitcher?: ReactNode;
  viewActions?: ReactNode;
};

export function TaskBoardToolbar({
  projectId,
  projectName,
  filters,
  modules,
  members,
  onFilterChange,
  onReset,
  onCreateTask,
  onCreateModule,
  viewSwitcher,
  viewActions,
}: TaskBoardToolbarProps) {
  return (
    <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_46%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#3370ff] shadow-sm">
              <KanbanSquare className="h-4 w-4" />
              项目看板
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#646a73]">
                <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 hover:text-[#1f2329]">
                  <ArrowLeft className="h-4 w-4" />
                  返回项目
                </Link>
              </div>
              <h1 className="mt-3 text-[30px] font-semibold tracking-tight text-[#1f2329]">{projectName}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#646a73]">
                按状态推进任务，拖拽后立即乐观更新到对应列，失败时会自动回滚。
              </p>
            </div>

            <ProjectViewTabs projectId={projectId} current="board" />
            {viewSwitcher}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/projects/${projectId}/tasks`}>
              <Button variant="outline">切换到任务列表</Button>
            </Link>
            {viewActions}
            <Button variant="outline" onClick={onCreateModule}>
              <Layers3 className="mr-2 h-4 w-4" />
              新建模块
            </Button>
            <Button onClick={() => onCreateTask()}>
              <Plus className="mr-2 h-4 w-4" />
              新建任务
            </Button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.3fr_repeat(3,minmax(0,220px))_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a7]" />
            <Input
              value={filters.keyword}
              onChange={(event) => onFilterChange("keyword", event.target.value || undefined)}
              placeholder="搜索任务标题、描述或任务编号"
              className="pl-11"
            />
          </div>

          <Select value={filters.priority ?? ""} onChange={(event) => onFilterChange("priority", event.target.value || undefined)}>
            <option value="">全部优先级</option>
            {TASK_PRIORITY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Select value={filters.moduleId ?? ""} onChange={(event) => onFilterChange("moduleId", event.target.value || undefined)}>
            <option value="">全部模块</option>
            <option value="none">未分类</option>
            {modules.map((moduleItem) => (
              <option key={moduleItem.id} value={moduleItem.id}>
                {moduleItem.name}
              </option>
            ))}
          </Select>

          <Select
            value={filters.assigneeId ?? ""}
            onChange={(event) => onFilterChange("assigneeId", event.target.value || undefined)}
          >
            <option value="">全部负责人</option>
            {members.map((member) => (
              <option key={member.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </Select>

          <Button type="button" variant="ghost" onClick={onReset}>
            重置筛选
          </Button>
        </div>
      </div>
    </section>
  );
}
