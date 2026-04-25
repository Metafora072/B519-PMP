"use client";

import { MemberAvatar } from "./member-avatar";

type MemberGroupMember = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type MemberGroupProps = {
  members: MemberGroupMember[];
  limit?: number;
};

export function MemberGroup({ members, limit = 5 }: MemberGroupProps) {
  const visibleMembers = members.slice(0, limit);
  const overflow = Math.max(0, members.length - visibleMembers.length);

  return (
    <div className="flex items-center">
      {visibleMembers.map((member, index) => (
        <div
          key={member.id}
          className={index === 0 ? "" : "-ml-2"}
          title={member.name}
        >
          <MemberAvatar memberKey={member.id} name={member.name} avatarUrl={member.avatarUrl} size="md" />
        </div>
      ))}
      {overflow > 0 ? (
        <div className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f5f9] text-xs font-medium text-[#4e5969] ring-1 ring-white">
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}
