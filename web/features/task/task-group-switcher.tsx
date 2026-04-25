"use client";

import { cn } from "@/lib/utils";

type TaskGroupSwitcherValue = "assignee" | "module" | "status" | "table";

type TaskGroupSwitcherProps = {
  value: TaskGroupSwitcherValue;
  onChange: (value: TaskGroupSwitcherValue) => void;
};

const options: Array<{ value: TaskGroupSwitcherValue; label: string }> = [
  { value: "assignee", label: "按负责人" },
  { value: "module", label: "按模块" },
  { value: "status", label: "按状态" },
  { value: "table", label: "平铺表格" },
];

export function TaskGroupSwitcher({ value, onChange }: TaskGroupSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-[#e6ebf2] bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            value === option.value
              ? "bg-[#edf3ff] text-[#245bdb]"
              : "text-[#646a73] hover:bg-[#f6f8fc] hover:text-[#1f2329]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
