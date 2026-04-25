"use client";

import Link from "next/link";
import { ArrowRight, KanbanSquare, LayoutList, Settings2, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberChip } from "@/features/member/member-chip";
import { ModuleSummaryList } from "@/features/module/module-summary-list";
import { ProjectActivityFeed } from "@/features/project/project-activity-feed";
import { ProjectJoinPolicyBadge } from "@/features/project/project-join-policy-badge";
import { ProjectMemberInviteDialog } from "@/features/project/project-member-invite-dialog";
import { ProjectMemberWorkloadCard } from "@/features/project/project-member-workload-card";
import { ProjectViewTabs } from "@/features/project/project-view-tabs";
import { ProjectVisibilityBadge } from "@/features/project/project-visibility-badge";
import {
  useProjectMemberWorkloadsQuery,
  useProjectMembersQuery,
  useProjectModulesQuery,
  useProjectQuery,
  useProjectTaskSummaryQuery,
} from "@/features/project/queries";
import { formatDateTime } from "@/lib/format";

type ProjectDetailPageProps = {
  projectId: string;
};

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const modulesQuery = useProjectModulesQuery(projectId);
  const workloadsQuery = useProjectMemberWorkloadsQuery(projectId);
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
  const members = (membersQuery.data ?? project.members).filter((member) => member.status === "ACTIVE");
  const modules = modulesQuery.data ?? [];
  const workloads = workloadsQuery.data ?? [];
  const summary = summaryQuery.data ?? { total: 0, inProgress: 0, completed: 0, overdue: 0 };
  const canManageMembers = project.viewerMembership?.role === "OWNER" || project.viewerMembership?.role === "ADMIN";
  const ownerMember = members.find((member) => member.user.id === project.owner.id) ?? null;
  const otherMembers = members.filter((member) => member.user.id !== project.owner.id);

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#e7ebf3] bg-white px-3 py-1.5 text-sm text-[#4e5969]">
                {project.projectKey}
              </span>
              <ProjectVisibilityBadge visibility={project.visibility} />
              <ProjectJoinPolicyBadge joinPolicy={project.joinPolicy} />
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
                <span>{project.memberCount} 位成员</span>
              </div>
              <div>最后更新：{formatDateTime(project.updatedAt)}</div>
              <div>负责人：{project.owner.name}</div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {ownerMember ? (
                  <MemberChip
                    memberKey={ownerMember.user.id}
                    name={ownerMember.user.name}
                    avatarUrl={ownerMember.user.avatarUrl}
                    meta="Owner"
                  />
                ) : null}
                {otherMembers.map((member) => (
                  <MemberChip
                    key={member.id}
                    memberKey={member.user.id}
                    name={member.user.name}
                    avatarUrl={member.user.avatarUrl}
                    meta={
                      member.role === "ADMIN"
                        ? "Admin"
                        : member.role === "GUEST"
                          ? "Guest"
                          : "Member"
                    }
                    compact
                  />
                ))}
              </div>
              <p className="text-sm text-[#646a73]">项目成员在这里直接展开显示，负责人负载见下方概览。</p>
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
            <Link href={`/projects/${project.id}/members`}>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                成员管理
              </Button>
            </Link>
            {canManageMembers ? (
              <Button onClick={() => setInviteDialogOpen(true)}>邀请成员</Button>
            ) : null}
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
        <ProjectMemberWorkloadCard items={workloads} />

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <ProjectActivityFeed projectId={project.id} />

          <Card className="border-[#e8edf4]">
            <CardHeader>
              <p className="text-sm text-[#8b95a7]">项目概览</p>
              <CardTitle className="mt-1">负责人视角说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-[#646a73]">
              <p>项目详情页现在会同时突出 owner、成员和负责人负载，不再把成员信息埋在边角位置。</p>
              <p>任务统计和成员负载都来自真实后端接口，可继续扩展到完整 workload 页面。</p>
              <p>最近动态已经接入真实 activity feed，后续可以继续扩展完整动态页与统计视图。</p>
            </CardContent>
          </Card>
        </section>
      </div>

      <ProjectMemberInviteDialog
        open={inviteDialogOpen}
        projectId={projectId}
        onClose={() => setInviteDialogOpen(false)}
      />
    </>
  );
}
