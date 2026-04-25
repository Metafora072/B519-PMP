"use client";

import { MemberChip } from "@/features/member/member-chip";

import type { ProjectMemberWorkload } from "@/services/types";

type ProjectMemberWorkloadCardProps = {
  items: ProjectMemberWorkload[];
};

export function ProjectMemberWorkloadCard({ items }: ProjectMemberWorkloadCardProps) {
  const visibleItems = items.slice(0, 8);

  return (
    <div className="rounded-[28px] border border-[#e8edf4] bg-white p-5 shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#8b95a7]">负责人负载</p>
          <h3 className="mt-1 text-xl font-semibold text-[#1f2329]">当前项目谁负责什么</h3>
        </div>
        <div className="rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs text-[#4e5969]">
          前 {visibleItems.length} 位成员
        </div>
      </div>

      {visibleItems.length > 0 ? (
        <div className="mt-5 space-y-3">
          {visibleItems.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 rounded-[22px] border border-[#edf1f6] bg-[#fbfcff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <MemberChip
                memberKey={member.user.id}
                name={member.user.name}
                avatarUrl={member.user.avatarUrl}
                meta={member.role === "OWNER" ? "Owner" : member.role === "ADMIN" ? "Admin" : undefined}
              />
              <div className="flex flex-wrap gap-2 text-sm text-[#4e5969]">
                <span className="rounded-full bg-white px-3 py-1.5">总任务 {member.stats.total}</span>
                <span className="rounded-full bg-white px-3 py-1.5">进行中 {member.stats.inProgress}</span>
                <span className="rounded-full bg-white px-3 py-1.5">逾期 {member.stats.overdue}</span>
                <span className="rounded-full bg-white px-3 py-1.5">P0/P1 {member.stats.p0 + member.stats.p1}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-[#d7dde8] bg-[#fbfcff] p-6 text-sm text-[#8b95a7]">
          当前项目还没有可统计的负责人负载数据。
        </div>
      )}
    </div>
  );
}
