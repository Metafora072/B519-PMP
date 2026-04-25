"use client";

import { AlertCircle, CheckCircle2, ChevronDown, Flame, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { AssigneeBadge } from "@/features/member/assignee-badge";
import { cn } from "@/lib/utils";

type TaskAssigneeGroupHeaderProps = {
  title: string;
  assignee?: {
    id?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  };
  collapsed: boolean;
  stats: {
    total: number;
    overdue: number;
    p0: number;
    p1: number;
    inProgress: number;
    done: number;
  };
  onToggle: () => void;
};

function SummaryBadge({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "danger" | "warning" | "success" | "progress";
  icon?: ReactNode;
}) {
  const toneClassName = {
    neutral: "border-[#e7ebf3] bg-white text-[#4e5969]",
    danger: value > 0 ? "border-[#ffd8d2] bg-[#fff5f2] text-[#d83931]" : "border-[#edf0f5] bg-white text-[#a8b0bd]",
    warning: value > 0 ? "border-[#ffe6bf] bg-[#fff8ed] text-[#b85f00]" : "border-[#edf0f5] bg-white text-[#a8b0bd]",
    success: "border-[#d8f0e4] bg-[#f2fbf6] text-[#00875a]",
    progress: "border-[#d9e8ff] bg-[#f3f7ff] text-[#3370ff]",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        toneClassName,
      )}
    >
      {icon}
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export function TaskAssigneeGroupHeader({
  title,
  assignee,
  collapsed,
  stats,
  onToggle,
}: TaskAssigneeGroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      className="group flex w-full flex-col gap-4 rounded-t-[24px] border-b border-[#e3e8f0] bg-[#f5f7fb] px-4 py-4 text-left transition hover:bg-[#f0f4fa] sm:px-5"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dde4f0] bg-white text-[#4e5969] shadow-sm">
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed ? "-rotate-90" : "rotate-0",
              )}
            />
          </span>
          <AssigneeBadge
            id={assignee?.id ?? null}
            name={assignee?.name ?? title}
            avatarUrl={assignee?.avatarUrl}
            emphasizeUnassigned={!assignee?.id}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SummaryBadge label="任务" value={stats.total} />
          <SummaryBadge
            label="逾期"
            value={stats.overdue}
            tone="danger"
            icon={<AlertCircle className="h-3.5 w-3.5" />}
          />
          <SummaryBadge label="P0" value={stats.p0} tone="danger" icon={<Flame className="h-3.5 w-3.5" />} />
          <SummaryBadge label="P1" value={stats.p1} tone="warning" />
          <SummaryBadge
            label="进行中"
            value={stats.inProgress}
            tone="progress"
            icon={<LoaderCircle className="h-3.5 w-3.5" />}
          />
          <SummaryBadge
            label="已完成"
            value={stats.done}
            tone="success"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          />
        </div>
      </div>
    </button>
  );
}
