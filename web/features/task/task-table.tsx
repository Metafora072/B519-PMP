"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskPriorityBadge, TaskStatusBadge } from "@/features/task/constants";
import { formatDate, formatDateTime } from "@/lib/format";

import type { PaginatedTasks, TaskRecord } from "@/services/types";

type TaskTableProps = {
  data: PaginatedTasks;
  onOpenTask: (task: TaskRecord) => void;
  onPageChange: (page: number) => void;
};

export function TaskTable({ data, onOpenTask, onPageChange }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e8edf4] bg-white shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#fbfcff] text-left text-xs uppercase tracking-[0.12em] text-[#8b95a7]">
            <tr>
              {["任务", "状态", "优先级", "模块", "负责人", "截止时间", "更新时间"].map((column) => (
                <th key={column} className="px-5 py-4 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.length > 0 ? (
              data.items.map((task) => (
                <tr
                  key={task.id}
                  className="cursor-pointer border-t border-[#eef1f6] transition hover:bg-[#f8fbff]"
                  onClick={() => onOpenTask(task)}
                >
                  <td className="px-5 py-4">
                    <div className="min-w-[280px]">
                      <p className="text-xs text-[#8b95a7]">{task.taskNo}</p>
                      <p className="mt-1 font-medium text-[#1f2329]">{task.title}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-[#646a73]">
                        {task.description || "暂无描述"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-4">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4e5969]">{task.module.name}</td>
                  <td className="px-5 py-4 text-sm text-[#4e5969]">{task.assignee?.name ?? "未分配"}</td>
                  <td className="px-5 py-4 text-sm text-[#4e5969]">{formatDate(task.dueAt)}</td>
                  <td className="px-5 py-4 text-sm text-[#8b95a7]">{formatDateTime(task.updatedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8b95a7]">
                  当前筛选条件下没有任务。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#eef1f6] px-5 py-4 text-sm text-[#4e5969] sm:flex-row sm:items-center sm:justify-between">
        <div>
          第 {data.pagination.page} / {data.pagination.totalPages} 页，共 {data.pagination.total} 条任务
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(data.pagination.page - 1)}
            disabled={data.pagination.page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(data.pagination.page + 1)}
            disabled={data.pagination.page >= data.pagination.totalPages}
          >
            下一页
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
