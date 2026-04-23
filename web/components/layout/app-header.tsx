import { Search } from "lucide-react";

import { LogoutButton } from "@/features/auth/logout-button";

export function AppHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-[#e5e6eb] bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-[#86909c]">工作台</p>
        <h2 className="mt-1 text-xl font-semibold text-[#1f2329]">首页</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 min-w-[280px] items-center gap-3 rounded-2xl border border-[#e5e6eb] bg-[#fbfcfe] px-4 text-sm text-[#86909c]">
          <Search className="h-4 w-4" />
          <span>搜索项目、任务、成员</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[#e5e6eb] bg-[#fbfcfe] px-4 py-2 text-sm text-[#646a73]">
            当前成员
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

