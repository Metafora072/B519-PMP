"use client";

import Link from "next/link";
import { ArrowLeft, ShieldPlus, UserMinus, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MemberChip } from "@/features/member/member-chip";
import { ProjectJoinPolicyBadge } from "@/features/project/project-join-policy-badge";
import { ProjectMemberInviteDialog } from "@/features/project/project-member-invite-dialog";
import {
  useApproveProjectMemberMutation,
  useProjectMembersQuery,
  useProjectQuery,
  useRejectProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
} from "@/features/project/queries";
import { ProjectViewTabs } from "@/features/project/project-view-tabs";
import { ProjectVisibilityBadge } from "@/features/project/project-visibility-badge";
import { formatDateTime } from "@/lib/format";

import type { ProjectRole } from "@/services/types";

type ProjectMembersPageProps = {
  projectId: string;
};

const roleOptions: Array<{ value: Exclude<ProjectRole, "OWNER">; label: string }> = [
  { value: "ADMIN", label: "管理员" },
  { value: "MEMBER", label: "成员" },
  { value: "GUEST", label: "访客" },
];

export function ProjectMembersPage({ projectId }: ProjectMembersPageProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const approveMutation = useApproveProjectMemberMutation(projectId);
  const rejectMutation = useRejectProjectMemberMutation(projectId);
  const removeMutation = useRemoveProjectMemberMutation(projectId);
  const updateRoleMutation = useUpdateProjectMemberRoleMutation(projectId);

  if (projectQuery.isLoading) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-8 text-sm text-[#8b95a7]">
        正在加载成员页...
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
        {projectQuery.error?.message ?? "成员页加载失败"}
      </div>
    );
  }

  const project = projectQuery.data;
  const members = membersQuery.data ?? [];
  const canManage = project.viewerMembership?.role === "OWNER" || project.viewerMembership?.role === "ADMIN";

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#3370ff] shadow-sm">
                <Users className="h-4 w-4" />
                项目成员
              </div>
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-[#1f2329]">{project.name}</h1>
                <p className="mt-2 text-sm leading-7 text-[#646a73]">
                  这里统一管理成员角色、加入状态与个人任务负载，产品语言和权限规则与项目主视图保持一致。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ProjectVisibilityBadge visibility={project.visibility} />
                <ProjectJoinPolicyBadge joinPolicy={project.joinPolicy} />
              </div>
              <ProjectViewTabs projectId={projectId} current="members" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/projects/${projectId}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回项目
                </Button>
              </Link>
              {canManage ? (
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <ShieldPlus className="mr-2 h-4 w-4" />
                  邀请成员
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <div className="rounded-[28px] border border-[#e8edf4] bg-white shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
          <div className="grid grid-cols-[minmax(260px,1.3fr)_110px_110px_160px_110px_110px_150px] gap-4 border-b border-[#eef1f6] px-6 py-4 text-xs uppercase tracking-[0.12em] text-[#8b95a7]">
            <div>成员</div>
            <div>角色</div>
            <div>状态</div>
            <div>加入时间</div>
            <div>负责数</div>
            <div>逾期</div>
            <div>P0 / P1</div>
          </div>

          <div className="divide-y divide-[#eef1f6]">
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[minmax(260px,1.3fr)_110px_110px_160px_110px_110px_150px] gap-4 px-6 py-5"
              >
                <div className="space-y-2">
                  <MemberChip
                    memberKey={member.user.id}
                    name={member.user.name}
                    avatarUrl={member.user.avatarUrl}
                    meta={member.user.email}
                  />
                  {(member.inviter || member.approver) ? (
                    <p className="text-xs text-[#8b95a7]">
                      {member.status === "INVITED" && member.inviter
                        ? `邀请人：${member.inviter.name}`
                        : member.status === "ACTIVE" && member.approver
                          ? `审批人：${member.approver.name}`
                          : null}
                    </p>
                  ) : null}
                  {canManage && member.role !== "OWNER" ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {member.status === "PENDING" || member.status === "INVITED" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void approveMutation.mutateAsync(member.id)}
                            disabled={approveMutation.isPending}
                          >
                            批准
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void rejectMutation.mutateAsync(member.id)}
                            disabled={rejectMutation.isPending}
                          >
                            拒绝
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void removeMutation.mutateAsync(member.id)}
                          disabled={removeMutation.isPending}
                        >
                          <UserMinus className="mr-1 h-3.5 w-3.5" />
                          移除
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center">
                  {canManage && member.role !== "OWNER" ? (
                    <Select
                      value={member.role}
                      onChange={(event) =>
                        void updateRoleMutation.mutateAsync({
                          memberId: member.id,
                          input: { role: event.target.value as Exclude<ProjectRole, "OWNER"> },
                        })
                      }
                      disabled={updateRoleMutation.isPending}
                    >
                      {roleOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <span className="text-sm font-medium text-[#1f2329]">
                      {member.role === "OWNER"
                        ? "Owner"
                        : member.role === "ADMIN"
                          ? "管理员"
                          : member.role === "MEMBER"
                            ? "成员"
                            : "访客"}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-sm text-[#4e5969]">
                  {member.status === "ACTIVE"
                    ? "已加入"
                    : member.status === "INVITED"
                      ? "已邀请"
                      : "待审批"}
                </div>
                <div className="flex items-center text-sm text-[#4e5969]">
                  {formatDateTime(member.joinedAt ?? member.createdAt)}
                </div>
                <div className="flex items-center text-sm font-medium text-[#1f2329]">{member.stats.total}</div>
                <div className="flex items-center text-sm font-medium text-[#d83931]">{member.stats.overdue}</div>
                <div className="flex items-center text-sm text-[#4e5969]">
                  {member.stats.p0} / {member.stats.p1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProjectMemberInviteDialog
        open={inviteDialogOpen}
        projectId={projectId}
        onClose={() => setInviteDialogOpen(false)}
      />
    </>
  );
}
