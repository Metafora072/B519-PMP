import { FolderKanban, Home, ListTodo, Settings, Bell } from "lucide-react";

const navItems = [
  { label: "首页", icon: Home, active: true },
  { label: "我的任务", icon: ListTodo },
  { label: "项目", icon: FolderKanban },
  { label: "通知", icon: Bell },
  { label: "设置", icon: Settings },
];

export function AppSidebar() {
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
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                item.active
                  ? "bg-[#f0f5ff] font-medium text-[#3370ff]"
                  : "text-[#646a73] hover:bg-[#f7f9fc]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-[#e5e6eb] bg-[#fbfcfe] p-4">
        <p className="text-sm font-medium text-[#1f2329]">当前阶段</p>
        <p className="mt-2 text-sm leading-6 text-[#646a73]">
          已进入基础工程与认证阶段，后续继续扩展项目、模块与任务域能力。
        </p>
      </div>
    </aside>
  );
}

