"use client";

import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

import { MemberAvatar } from "./member-avatar";

type AssigneeBadgeProps = {
  id?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  emphasizeUnassigned?: boolean;
};

export function AssigneeBadge({
  id,
  name,
  avatarUrl,
  emphasizeUnassigned = false,
}: AssigneeBadgeProps) {
  if (!id || !name) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
          emphasizeUnassigned
            ? "border-[#ffd8bf] bg-[#fff6eb] text-[#b85f00]"
            : "border-[#e7ebf3] bg-[#f7f8fb] text-[#6b7280]",
        )}
      >
        <UserRound className="h-4 w-4" />
        未分配
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white px-3 py-1.5 text-sm font-medium text-[#1f2329]">
      <MemberAvatar memberKey={id} name={name} avatarUrl={avatarUrl} size="sm" />
      {name}
    </span>
  );
}
