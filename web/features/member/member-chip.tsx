"use client";

import { cn } from "@/lib/utils";

import { MemberAvatar } from "./member-avatar";
import { getMemberColorToken } from "./member-color";

type MemberChipProps = {
  memberKey: string;
  name: string;
  avatarUrl?: string | null;
  meta?: string;
  compact?: boolean;
  className?: string;
};

export function MemberChip({
  memberKey,
  name,
  avatarUrl,
  meta,
  compact = false,
  className,
}: MemberChipProps) {
  const color = getMemberColorToken(memberKey);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        color.bg,
        color.ring,
        className,
      )}
    >
      <MemberAvatar memberKey={memberKey} name={name} avatarUrl={avatarUrl} size={compact ? "sm" : "md"} />
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-medium", color.text)}>{name}</span>
        {meta ? <span className="text-xs text-[#6b7280]">{meta}</span> : null}
      </div>
    </div>
  );
}
