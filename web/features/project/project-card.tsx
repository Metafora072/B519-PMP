"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MemberChip } from "@/features/member/member-chip";
import { ProjectJoinButton } from "@/features/project/project-join-button";
import { ProjectJoinPolicyBadge } from "@/features/project/project-join-policy-badge";
import { ProjectVisibilityBadge } from "@/features/project/project-visibility-badge";
import { formatRelativeUpdate, getInitials } from "@/lib/format";

import type { ProjectSummary } from "@/services/types";

type ProjectCardProps = {
  project: ProjectSummary;
  mode: "joined" | "discoverable";
};

export function ProjectCard({ project, mode }: ProjectCardProps) {
  const orderedMembers = [
    ...project.members.filter((member) => member.role === "OWNER"),
    ...project.members.filter((member) => member.role === "ADMIN"),
    ...project.members.filter((member) => member.role === "MEMBER"),
    ...project.members.filter((member) => member.role === "GUEST"),
  ];

  const cardContent = (
    <div className="group block rounded-[28px] border border-[#e7ebf3] bg-white p-6 shadow-[0_14px_32px_rgba(31,35,41,0.04)] transition hover:-translate-y-0.5 hover:border-[#c5d7ff] hover:shadow-[0_18px_36px_rgba(51,112,255,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef4ff] text-lg font-semibold text-[#3370ff]">
            {getInitials(project.name)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-[#1f2329]">{project.name}</h3>
              <Badge variant="outline">{project.projectKey}</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#646a73]">
              {project.description || "当前项目还没有补充描述，后续可继续完善协作背景与交付范围。"}
            </p>
          </div>
        </div>
        {mode === "joined" ? (
          <ArrowRight className="h-5 w-5 text-[#b4bfce] transition group-hover:text-[#3370ff]" />
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ProjectVisibilityBadge visibility={project.visibility} />
        <ProjectJoinPolicyBadge joinPolicy={project.joinPolicy} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {orderedMembers.map((member) => (
          <MemberChip
            key={member.id}
            memberKey={member.user.id}
            name={member.user.name}
            avatarUrl={member.user.avatarUrl}
            meta={
              member.role === "OWNER"
                ? "Owner"
                : member.role === "ADMIN"
                  ? "Admin"
                  : member.role === "GUEST"
                    ? "Guest"
                    : "Member"
            }
            compact
          />
        ))}
        {project.viewerMembership?.status === "PENDING" ? (
          <span className="rounded-full bg-[#fff7e8] px-3 py-1.5 text-xs font-medium text-[#9a6700]">
            请求已发送
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#f8faff] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[#8b95a7]">
            <Users className="h-4 w-4" />
            成员
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#1f2329]">{project.memberCount}</p>
        </div>
        <div className="rounded-2xl bg-[#f8faff] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[#8b95a7]">
            <FolderKanban className="h-4 w-4" />
            任务
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#1f2329]">{project._count.tasks}</p>
        </div>
        <div className="rounded-2xl bg-[#f8faff] px-4 py-3">
          <p className="text-sm text-[#8b95a7]">最近更新</p>
          <p className="mt-2 text-base font-medium text-[#1f2329]">{formatRelativeUpdate(project.updatedAt)}</p>
        </div>
      </div>

      {mode === "discoverable" ? (
        <div className="mt-6 flex items-center justify-end gap-3">
          <ProjectJoinButton project={project} />
        </div>
      ) : null}
    </div>
  );

  if (mode === "joined") {
    return <Link href={`/projects/${project.id}`}>{cardContent}</Link>;
  }

  return cardContent;
}
