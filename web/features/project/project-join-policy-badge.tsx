"use client";

import { Badge } from "@/components/ui/badge";

import type { JoinPolicy } from "@/services/types";

const joinPolicyMeta: Record<JoinPolicy, { label: string; className: string }> = {
  INVITE_ONLY: {
    label: "加入方式 · 仅邀请",
    className: "border-[#f0e0c2] bg-[#fff8ea] text-[#9a6700]",
  },
  REQUEST_APPROVAL: {
    label: "加入方式 · 申请审批",
    className: "border-[#e4d6ff] bg-[#f8f4ff] text-[#6c45b5]",
  },
  OPEN: {
    label: "加入方式 · 可直接加入",
    className: "border-[#d7efe3] bg-[#f2fbf6] text-[#13795b]",
  },
};

export function ProjectJoinPolicyBadge({ joinPolicy }: { joinPolicy: JoinPolicy }) {
  const meta = joinPolicyMeta[joinPolicy];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
