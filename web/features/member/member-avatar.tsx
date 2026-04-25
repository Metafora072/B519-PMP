"use client";

import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

import { getMemberColorToken } from "./member-color";

type MemberAvatarProps = {
  memberKey: string;
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
} as const;

export function MemberAvatar({
  memberKey,
  name,
  avatarUrl,
  size = "md",
  className,
}: MemberAvatarProps) {
  const color = getMemberColorToken(memberKey);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-1 ring-[#ffffff]",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold ring-1 ring-white",
        color.bg,
        color.text,
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
