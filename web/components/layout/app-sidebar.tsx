"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { FolderKanban, Home, Settings } from "lucide-react";

const navItems: Array<{
  label: string;
  icon: typeof Home;
  href?: Route;
  disabled?: boolean;
}> = [
  { label: "首页", icon: Home, href: "/" },
  { label: "项目", icon: FolderKanban, href: "/projects" },
  { label: "设置", icon: Settings, disabled: true },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 rounded-[24px] border border-[#e5e6eb] bg-white p-5 shadow-card lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3ff] text-lg font-semibold text-[#3370ff]">
          CP
        </div>
        <div>
          <p className="font-semibold text-[#1f2329]">Code Platform</p>
          <p className="text-sm text-[#86909c]">Project Workspace</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : Boolean(item.href && pathname.startsWith(item.href));

          const className = `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
            isActive
              ? "bg-[#f0f5ff] font-medium text-[#3370ff]"
              : item.disabled
                ? "cursor-not-allowed text-[#b4bfce]"
                : "text-[#646a73] hover:bg-[#f7f9fc]"
          }`;

          return item.href ? (
            <Link key={item.label} href={item.href} className={className}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ) : (
            <div key={item.label} className={className}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-[#e5e6eb] bg-[#fbfcfe] p-4">
        <p className="text-sm font-medium text-[#1f2329]">当前阶段</p>
        <p className="mt-2 text-sm leading-6 text-[#646a73]">
          已进入第 3 阶段，前端项目页、任务列表页与详情抽屉正在承接真实业务数据。
        </p>
      </div>
    </aside>
  );
}
