"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/features/auth/logout-button";
import { queryKeys } from "@/services/query-keys";
import { getCurrentUser } from "@/services/auth";

function getRouteMeta(pathname: string) {
  if (pathname.startsWith("/projects/") && pathname.endsWith("/tasks")) {
    return {
      eyebrow: "项目任务",
      title: "任务列表",
    };
  }

  if (pathname.startsWith("/projects/")) {
    return {
      eyebrow: "项目空间",
      title: "项目详情",
    };
  }

  if (pathname.startsWith("/projects")) {
    return {
      eyebrow: "项目空间",
      title: "项目列表",
    };
  }

  return {
    eyebrow: "工作台",
    title: "首页",
  };
}

export function AppHeader() {
  const pathname = usePathname();
  const routeMeta = getRouteMeta(pathname);
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
  });

  return (
    <header className="flex flex-col gap-4 border-b border-[#e5e6eb] bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-[#86909c]">{routeMeta.eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-[#1f2329]">{routeMeta.title}</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 min-w-[280px] items-center gap-3 rounded-2xl border border-[#e5e6eb] bg-[#fbfcfe] px-4 text-sm text-[#86909c]">
          <Search className="h-4 w-4" />
          <span>搜索项目、任务、成员（下一阶段接入全局搜索）</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[#e5e6eb] bg-[#fbfcfe] px-4 py-2 text-sm text-[#646a73]">
            {currentUserQuery.data?.name ?? "当前成员"}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
