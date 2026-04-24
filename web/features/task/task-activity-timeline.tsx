"use client";

import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTaskActivitiesQuery } from "@/features/task/queries";
import { TaskActivityItem } from "@/features/task/task-activity-item";

type TaskActivityTimelineProps = {
  taskId: string;
};

export function TaskActivityTimeline({ taskId }: TaskActivityTimelineProps) {
  const activitiesQuery = useTaskActivitiesQuery(taskId, {
    page: 1,
    pageSize: 20,
  });

  return (
    <section className="space-y-4 rounded-[24px] border border-[#e8edf4] bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-[#1f2329]">
        <History className="h-4 w-4 text-[#3370ff]" />
        活动日志
      </div>

      {activitiesQuery.isLoading ? (
        <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm text-[#8b95a7]">
          正在加载活动日志...
        </div>
      ) : activitiesQuery.isError ? (
        <div className="rounded-[20px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-5 text-sm text-[#d83931]">
          {activitiesQuery.error.message}
        </div>
      ) : activitiesQuery.data?.items.length ? (
        <>
          <div className="space-y-3">
            {activitiesQuery.data.items.map((activity) => (
              <TaskActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
          {activitiesQuery.data.pagination.total > activitiesQuery.data.items.length ? (
            <div className="flex justify-center">
              <Button type="button" variant="ghost" disabled>
                当前展示最近 {activitiesQuery.data.items.length} 条动态
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm leading-7 text-[#8b95a7]">
          目前还没有活动日志，后续任务变更和评论会自动沉淀在这里。
        </div>
      )}
    </section>
  );
}
