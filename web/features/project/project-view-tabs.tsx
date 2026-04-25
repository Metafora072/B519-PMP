"use client";

import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ProjectViewTabsProps = {
  projectId: string;
  current: "overview" | "tasks" | "board" | "members";
};

const tabs = [
  { key: "overview", label: "Overview", href: (projectId: string) => `/projects/${projectId}` },
  { key: "tasks", label: "Tasks", href: (projectId: string) => `/projects/${projectId}/tasks` },
  { key: "board", label: "Board", href: (projectId: string) => `/projects/${projectId}/board` },
  { key: "members", label: "Members", href: (projectId: string) => `/projects/${projectId}/members` },
] as const;

export function ProjectViewTabs({ projectId, current }: ProjectViewTabsProps) {
  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-2xl border border-[#e6ebf2] bg-white/90 p-1 shadow-sm">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href(projectId) as Route}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            current === tab.key
              ? "bg-[#edf3ff] text-[#245bdb]"
              : "text-[#646a73] hover:bg-[#f6f8fc] hover:text-[#1f2329]",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
