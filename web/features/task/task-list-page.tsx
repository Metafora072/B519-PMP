"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KanbanSquare, Layers3, ListFilter, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModuleCreateDialog } from "@/features/module/module-create-dialog";
import { ProjectViewTabs } from "@/features/project/project-view-tabs";
import { TaskCreateDialog } from "@/features/task/task-create-dialog";
import { TaskDetailDrawer } from "@/features/task/task-detail-drawer";
import { TaskFiltersBar } from "@/features/task/task-filters-bar";
import { TaskTable } from "@/features/task/task-table";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useTaskDrawerStore } from "@/store/task-drawer-store";
import {
  useProjectMembersQuery,
  useProjectModulesQuery,
  useProjectQuery,
} from "@/features/project/queries";
import { useProjectTasksQuery } from "@/features/task/queries";

type TaskListPageProps = {
  projectId: string;
};

export function TaskListPage({ projectId }: TaskListPageProps) {
  const { filters, queryFilters, resetFilters, updateFilter } = useTaskFilters();
  const openDrawer = useTaskDrawerStore((state) => state.openDrawer);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);

  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const modulesQuery = useProjectModulesQuery(projectId);
  const tasksQuery = useProjectTasksQuery(projectId, queryFilters);

  const members = membersQuery.data ?? [];
  const modules = modulesQuery.data ?? [];

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
                顶部筛选、关键字搜索、分页与右侧详情抽屉都已接入真实任务接口，任务视图与看板视图共享同一套缓存。
              </p>
            </div>
            <ProjectViewTabs projectId={projectId} current="tasks" />
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
        <TaskTable
          data={tasksQuery.data}
          onOpenTask={(task) => openDrawer({ projectId, taskId: task.id })}
          onPageChange={(page) => updateFilter("page", page)}
        />
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
