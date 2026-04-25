"use client";

import { Badge } from "@/components/ui/badge";

import type { ProjectVisibility } from "@/services/types";

const visibilityMeta: Record<ProjectVisibility, { label: string; className: string }> = {
  PRIVATE: {
    label: "项目可见性 · 私密",
    className: "border-[#e7ebf3] bg-white text-[#4e5969]",
  },
  MEMBERS_VISIBLE: {
    label: "项目可见性 · 成员可见",
    className: "border-[#d9e8ff] bg-[#f4f8ff] text-[#245bdb]",
  },
  ORG_VISIBLE: {
    label: "项目可见性 · 组织内可见",
    className: "border-[#d7efe3] bg-[#f2fbf6] text-[#13795b]",
  },
};

export function ProjectVisibilityBadge({ visibility }: { visibility: ProjectVisibility }) {
  const meta = visibilityMeta[visibility];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
