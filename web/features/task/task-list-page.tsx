"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KanbanSquare, Layers3, ListFilter, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MemberChip } from "@/features/member/member-chip";
import { ModuleCreateDialog } from "@/features/module/module-create-dialog";
import { ProjectViewTabs } from "@/features/project/project-view-tabs";
import { TaskAssigneeGroupSection } from "@/features/task/task-assignee-group-section";
import { TaskCreateDialog } from "@/features/task/task-create-dialog";
import { TaskDetailDrawer } from "@/features/task/task-detail-drawer";
import { TaskFiltersBar } from "@/features/task/task-filters-bar";
import { TaskGroupSwitcher } from "@/features/task/task-group-switcher";
import { useTaskGroupCollapse } from "@/features/task/hooks/use-task-group-collapse";
import { TaskListGroupedByAssignee } from "@/features/task/task-list-grouped-by-assignee";
import { TaskTable } from "@/features/task/task-table";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useTaskDrawerStore } from "@/store/task-drawer-store";
import {
  useProjectMembersQuery,
  useProjectModulesQuery,
  useProjectQuery,
} from "@/features/project/queries";
import { useProjectTasksQuery } from "@/features/task/queries";

import type { PaginatedTasks, TaskRecord } from "@/services/types";

type TaskListPageProps = {
  projectId: string;
};

type TaskGroupMode = "assignee" | "module" | "status" | "table";

function groupTasks(items: TaskRecord[], mode: Exclude<TaskGroupMode, "table">) {
  const groups = new Map<string, { title: string; tasks: TaskRecord[] }>();

  for (const task of items) {
    const descriptor =
      mode === "assignee"
        ? {
            key: task.assignee?.id ?? "unassigned",
            title: task.assignee?.name ?? "未分配",
          }
        : mode === "module"
          ? {
              key: task.module?.id ?? "none",
              title: task.module?.name ?? "未分类",
            }
          : {
              key: task.status,
              title: task.status === "TODO" ? "Todo" : task.status === "IN_PROGRESS" ? "In Progress" : task.status,
            };

    const current = groups.get(descriptor.key) ?? { title: descriptor.title, tasks: [] };
    current.tasks.push(task);
    groups.set(descriptor.key, current);
  }

  return Array.from(groups.entries()).map(([key, value]) => ({
    key,
    ...value,
  }));
}

export function TaskListPage({ projectId }: TaskListPageProps) {
  const { filters, queryFilters, resetFilters, updateFilter } = useTaskFilters();
  const openDrawer = useTaskDrawerStore((state) => state.openDrawer);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [groupMode, setGroupMode] = useState<TaskGroupMode>("assignee");
  const { isCollapsed: isFallbackGroupCollapsed, toggleGroup: toggleFallbackGroup } = useTaskGroupCollapse();

  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const modulesQuery = useProjectModulesQuery(projectId);
  const tasksQuery = useProjectTasksQuery(projectId, {
    ...queryFilters,
    groupBy: groupMode === "table" ? "assignee" : groupMode,
    viewMode: "list",
  });

  const members = useMemo(
    () => (membersQuery.data ?? []).filter((member) => member.status === "ACTIVE"),
    [membersQuery.data],
  );
  const modules = modulesQuery.data ?? [];

  function renderGroupedContent(data: PaginatedTasks) {
    if (groupMode === "assignee") {
      return <TaskListGroupedByAssignee data={data} onOpenTask={(task) => openDrawer({ projectId, taskId: task.id })} />;
    }

    if (groupMode === "table") {
      return (
        <TaskTable
          data={data}
          onOpenTask={(task) => openDrawer({ projectId, taskId: task.id })}
          onPageChange={(page) => updateFilter("page", page)}
        />
      );
    }

    const groups = groupTasks(data.items, groupMode);
    return (
      <div className="space-y-4">
        {groups.map((group) => (
          <TaskAssigneeGroupSection
            key={group.key}
            title={group.title}
            tasks={group.tasks}
            collapsed={isFallbackGroupCollapsed(`${groupMode}-${group.key}`)}
            onToggle={() => toggleFallbackGroup(`${groupMode}-${group.key}`)}
            onOpenTask={(task) => openDrawer({ projectId, taskId: task.id })}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#3370ff] shadow-sm">
              <ListFilter className="h-4 w-4" />
              任务列表
            </div>
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-[#1f2329]">
                {projectQuery.data?.name ?? "项目任务"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#646a73]">
                任务页默认按负责人组织。进入项目后，第一眼看到的是“谁负责哪些任务”，而不是一整张无差别平铺表格。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ProjectViewTabs projectId={projectId} current="tasks" />
              <TaskGroupSwitcher value={groupMode} onChange={setGroupMode} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-[#4e5969]">
                <Users className="h-4 w-4 text-[#8b95a7]" />
                当前活跃成员
              </span>
              {members.slice(0, 4).map((member) => (
                <MemberChip
                  key={member.id}
                  memberKey={member.user.id}
                  name={member.user.name}
                  avatarUrl={member.user.avatarUrl}
                  compact
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/projects/${projectId}`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回项目详情
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/board`}>
              <Button variant="secondary">
                <KanbanSquare className="mr-2 h-4 w-4" />
                切换到看板
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/members`}>
              <Button variant="outline">成员页</Button>
            </Link>
            <Button variant="outline" onClick={() => setCreateModuleOpen(true)}>
              <Layers3 className="mr-2 h-4 w-4" />
              新建模块
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建任务
            </Button>
          </div>
        </div>
      </section>

      <TaskFiltersBar
        filters={filters}
        members={members}
        modules={modules}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {tasksQuery.isLoading ? (
        <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-8 text-sm text-[#8b95a7]">
          正在加载任务列表...
        </div>
      ) : tasksQuery.isError ? (
        <div className="rounded-[28px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
          {tasksQuery.error.message}
        </div>
      ) : tasksQuery.data ? (
        renderGroupedContent(tasksQuery.data)
      ) : null}

      <TaskDetailDrawer members={members} modules={modules} />
      <TaskCreateDialog
        open={createDialogOpen}
        projectId={projectId}
        modules={modules}
        members={members}
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
