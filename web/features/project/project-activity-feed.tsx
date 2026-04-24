"use client";

import { ChevronRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTaskActivityActionLabel,
  getTaskActivityDescription,
} from "@/features/task/activity-presenter";
import { useProjectActivitiesQuery } from "@/features/project/queries";
import { formatDateTime } from "@/lib/format";

type ProjectActivityFeedProps = {
  projectId: string;
};

export function ProjectActivityFeed({ projectId }: ProjectActivityFeedProps) {
  const activitiesQuery = useProjectActivitiesQuery(projectId, {
    page: 1,
    pageSize: 12,
  });

  return (
    <Card className="border-[#e8edf4]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <p className="text-sm text-[#8b95a7]">最近动态</p>
          <CardTitle className="mt-1">项目协作在这里持续沉淀</CardTitle>
        </div>
        <Sparkles className="h-5 w-5 text-[#3370ff]" />
      </CardHeader>
      <CardContent className="space-y-3">
        {activitiesQuery.isLoading ? (
          <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm text-[#8b95a7]">
            正在加载最近动态...
          </div>
        ) : activitiesQuery.isError ? (
          <div className="rounded-[20px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-5 text-sm text-[#d83931]">
            {activitiesQuery.error.message}
          </div>
        ) : activitiesQuery.data?.items.length ? (
          <>
            <div className="space-y-3">
              {activitiesQuery.data.items.map((activity) => {
                const actionLabel = getTaskActivityActionLabel(activity.actionType);
                const description = getTaskActivityDescription(activity);

                return (
                  <div
                    key={activity.id}
                    className="rounded-[20px] border border-[#eef1f6] bg-[#fbfcff] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-medium text-[#1f2329]">
                        {activity.operator.name} · {actionLabel}
                      </p>
                      <p className="text-xs text-[#8b95a7]">{formatDateTime(activity.createdAt)}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#646a73]">
                      {activity.task.taskNo} · {activity.task.title}
                    </p>
                    {description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4e5969]">{description}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm">
                查看更多
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm leading-7 text-[#8b95a7]">
            项目还没有动态记录。后续任务变更、评论和协作行为会自动出现在这里。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
