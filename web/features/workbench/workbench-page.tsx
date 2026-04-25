"use client";

import Link from "next/link";
import { AlarmClockCheck, ArrowUpRight, BriefcaseBusiness, Clock3, FolderKanban, Sparkles, UserCheck2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssigneeBadge } from "@/features/member/assignee-badge";
import { useProjectMembersQuery } from "@/features/project/queries";
import { TaskPriorityBadge, TaskStatusBadge } from "@/features/task/constants";
import { TaskDetailDrawer } from "@/features/task/task-detail-drawer";
import { useProjectModulesQuery } from "@/features/project/queries";
import { useMyPendingActionsQuery, useMyTasksQuery, useWorkbenchSummaryQuery } from "@/features/workbench/queries";
import { formatDateTime } from "@/lib/format";
import { useTaskDrawerStore } from "@/store/task-drawer-store";

import type { TaskRecord, WorkbenchTaskScope } from "@/services/types";

const SECTION_META: Array<{
  scope: WorkbenchTaskScope;
  title: string;
  description: string;
}> = [
  { scope: "assigned", title: "指派给我", description: "优先处理直接挂在你名下的任务。" },
  { scope: "overdue", title: "逾期任务", description: "先收敛风险，再决定是否调期。" },
  { scope: "dueToday", title: "今日到期", description: "今天需要推进或确认是否完成。" },
  { scope: "highPriority", title: "高优任务", description: "聚焦 P0 / P1 的交付压力。" },
  { scope: "created", title: "我创建的", description: "追踪你发起的事项是否顺利推进。" },
  { scope: "watching", title: "我关注的", description: "本阶段先保留关注位，后续补任务关注能力。" },
];

function TaskWorkbenchSection({
  title,
  description,
  tasks,
  onOpenTask,
}: {
  title: string;
  description: string;
  tasks?: TaskRecord[];
  onOpenTask: (task: TaskRecord) => void;
}) {
  return (
    <Card className="border-[#e8edf4]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm leading-6 text-[#646a73]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks?.length ? (
          tasks.slice(0, 6).map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask(task)}
              className="w-full rounded-[20px] border border-[#e8edf4] bg-[#fbfcff] p-4 text-left transition hover:border-[#c9d7ff] hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1f2329]">{task.title}</p>
                  <p className="mt-1 text-xs text-[#8b95a7]">
                    {task.project.name} · {task.module?.name ?? "未分类"} · {task.taskNo}
                  </p>
                </div>
                <TaskPriorityBadge priority={task.priority} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <AssigneeBadge
                  id={task.assignee?.id ?? null}
                  name={task.assignee?.name ?? null}
                  avatarUrl={task.assignee?.avatarUrl}
                  emphasizeUnassigned
                />
                {task.dueAt ? (
                  <span className="rounded-full bg-[#f2f3f5] px-3 py-1 text-xs text-[#646a73]">
                    截止 {formatDateTime(task.dueAt)}
                  </span>
                ) : null}
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-4 text-sm leading-7 text-[#8b95a7]">
            当前分区暂无任务。
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkbenchPage() {
  const openDrawer = useTaskDrawerStore((state) => state.openDrawer);
  const drawerProjectId = useTaskDrawerStore((state) => state.projectId);
  const summaryQuery = useWorkbenchSummaryQuery();
  const pendingActionsQuery = useMyPendingActionsQuery();
  const assignedQuery = useMyTasksQuery("assigned");
  const createdQuery = useMyTasksQuery("created");
  const watchingQuery = useMyTasksQuery("watching");
  const overdueQuery = useMyTasksQuery("overdue");
  const dueTodayQuery = useMyTasksQuery("dueToday");
  const highPriorityQuery = useMyTasksQuery("highPriority");
  const drawerMembersQuery = useProjectMembersQuery(drawerProjectId ?? "");
  const drawerModulesQuery = useProjectModulesQuery(drawerProjectId ?? "");

  const sectionMap: Record<WorkbenchTaskScope, TaskRecord[] | undefined> = {
    assigned: assignedQuery.data,
    created: createdQuery.data,
    watching: watchingQuery.data,
    overdue: overdueQuery.data,
    dueToday: dueTodayQuery.data,
    highPriority: highPriorityQuery.data,
  };

  function handleOpenTask(task: TaskRecord) {
    openDrawer({ projectId: task.projectId, taskId: task.id });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_48%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#3370ff] shadow-sm">
              <BriefcaseBusiness className="h-4 w-4" />
              我的工作台
            </div>
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-[#1f2329]">从个人入口推进每天的工作流</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#646a73]">
                这里聚合跨项目的“指派给我、我创建的、待我审批、逾期与高优任务”，让你先看清自己要对什么负责。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/projects">
              <Button variant="outline">
                <FolderKanban className="mr-2 h-4 w-4" />
                查看项目
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#e8edf4]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[#646a73]">指派给我</CardTitle>
            <UserCheck2 className="h-4 w-4 text-[#3370ff]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#1f2329]">{summaryQuery.data?.assigned ?? "--"}</p>
          </CardContent>
        </Card>
        <Card className="border-[#e8edf4]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[#646a73]">待我审批</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#3370ff]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#1f2329]">{summaryQuery.data?.pendingActions ?? "--"}</p>
          </CardContent>
        </Card>
        <Card className="border-[#e8edf4]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[#646a73]">今日到期</CardTitle>
            <Clock3 className="h-4 w-4 text-[#3370ff]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#1f2329]">{summaryQuery.data?.dueToday ?? "--"}</p>
          </CardContent>
        </Card>
        <Card className="border-[#e8edf4]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[#646a73]">高优任务</CardTitle>
            <Sparkles className="h-4 w-4 text-[#3370ff]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#1f2329]">{summaryQuery.data?.highPriority ?? "--"}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-[#e8edf4]">
          <CardHeader>
            <CardTitle>待我审批</CardTitle>
            <p className="text-sm leading-6 text-[#646a73]">当前先聚合项目加入申请，后续可扩展任务审批。</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActionsQuery.data?.length ? (
              pendingActionsQuery.data.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-[#e8edf4] bg-[#fbfcff] p-4">
                  <p className="text-sm font-medium text-[#1f2329]">{item.requester.name} 申请加入项目「{item.project.name}」</p>
                  <p className="mt-1 text-xs text-[#8b95a7]">{formatDateTime(item.createdAt)}</p>
                  <div className="mt-3">
                    <Link href={`/projects/${item.project.id}/members`}>
                      <Button variant="outline" size="sm">
                        <AlarmClockCheck className="mr-2 h-4 w-4" />
                        前往审批
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-4 text-sm leading-7 text-[#8b95a7]">
                当前没有待处理的加入申请。
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#e8edf4]">
          <CardHeader>
            <CardTitle>工作台说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[#646a73]">
            <p>默认继续向负责人视角倾斜，优先呈现指派给你、逾期、今日到期与高优任务。</p>
            <p>“我关注的”本阶段先保留位置，下一阶段可继续补任务关注与收藏视图。</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {SECTION_META.map((section) => (
          <TaskWorkbenchSection
            key={section.scope}
            title={section.title}
            description={section.description}
            tasks={sectionMap[section.scope]}
            onOpenTask={handleOpenTask}
          />
        ))}
      </section>

      <TaskDetailDrawer
        members={(drawerMembersQuery.data ?? []).filter((member) => member.status === "ACTIVE")}
        modules={drawerModulesQuery.data ?? []}
      />
    </div>
  );
}
