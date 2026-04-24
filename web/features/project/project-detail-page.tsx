"use client";

import Link from "next/link";
import { ArrowRight, KanbanSquare, LayoutList, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleSummaryList } from "@/features/module/module-summary-list";
import { ProjectActivityFeed } from "@/features/project/project-activity-feed";
import { ProjectViewTabs } from "@/features/project/project-view-tabs";
import {
  useProjectMembersQuery,
  useProjectModulesQuery,
  useProjectQuery,
  useProjectTaskSummaryQuery,
} from "@/features/project/queries";
import { formatDateTime, getInitials } from "@/lib/format";

type ProjectDetailPageProps = {
  projectId: string;
};

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const modulesQuery = useProjectModulesQuery(projectId);
  const summaryQuery = useProjectTaskSummaryQuery(projectId);

  if (projectQuery.isLoading) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-8 text-sm text-[#8b95a7]">
        正在加载项目详情...
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
        {projectQuery.error?.message ?? "项目详情加载失败"}
      </div>
    );
  }

  const project = projectQuery.data;
  const members = membersQuery.data ?? project.members;
  const modules = modulesQuery.data ?? [];
  const summary = summaryQuery.data ?? { total: 0, inProgress: 0, completed: 0, overdue: 0 };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{project.projectKey}</Badge>
              <Badge variant="secondary">项目详情</Badge>
            </div>

            <div>
              <h1 className="text-[32px] font-semibold tracking-tight text-[#1f2329]">{project.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#646a73]">
                {project.description || "当前项目还没有补充描述，后续可以继续完善目标、角色分工与阶段计划。"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-[#4e5969]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#8b95a7]" />
                <span>{members.length} 位成员</span>
              </div>
              <div>最后更新：{formatDateTime(project.updatedAt)}</div>
              <div>负责人：{project.owner.name}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {members.slice(0, 6).map((member) => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white px-3 py-2 text-sm text-[#4e5969]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4ff] text-xs font-semibold text-[#3370ff]">
                    {getInitials(member.user.name)}
                  </span>
                  <span>{member.user.name}</span>
                </div>
              ))}
            </div>

            <ProjectViewTabs projectId={project.id} current="overview" />
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Link href={`/projects/${project.id}/tasks`}>
              <Button>
                <LayoutList className="mr-2 h-4 w-4" />
                查看任务页
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/board`}>
              <Button variant="secondary">
                <KanbanSquare className="mr-2 h-4 w-4" />
                看板视图
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline">
                返回项目列表
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "总任务", value: summary.total, tone: "text-[#1f2329]" },
          { label: "进行中", value: summary.inProgress, tone: "text-[#3370ff]" },
          { label: "已完成", value: summary.completed, tone: "text-[#00a870]" },
          { label: "已逾期", value: summary.overdue, tone: "text-[#d83931]" },
        ].map((item) => (
          <Card key={item.label} className="border-[#e8edf4]">
            <CardContent className="p-5">
              <p className="text-sm text-[#8b95a7]">{item.label}</p>
              <p className={`mt-3 text-[32px] font-semibold ${item.tone}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <ModuleSummaryList projectId={project.id} modules={modules} />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ProjectActivityFeed projectId={project.id} />

        <Card className="border-[#e8edf4]">
          <CardHeader>
            <p className="text-sm text-[#8b95a7]">项目概览</p>
            <CardTitle className="mt-1">当前阶段说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[#646a73]">
            <p>项目详情页已串起项目基础信息、成员、模块与任务统计。</p>
            <p>任务统计通过真实任务接口汇总得到，不再依赖静态 mock。</p>
            <p>最近动态已经接入真实 activity feed，后续可以继续扩展完整动态页与统计视图。</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
