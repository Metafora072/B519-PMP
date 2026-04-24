"use client";

import { CircleDot } from "lucide-react";

import {
  getTaskActivityActionLabel,
  getTaskActivityDescription,
} from "@/features/task/activity-presenter";
import { formatDateTime } from "@/lib/format";

import type { TaskActivityRecord } from "@/services/types";

export function TaskActivityItem({ activity }: { activity: TaskActivityRecord }) {
  const actionLabel = getTaskActivityActionLabel(activity.actionType);
  const description = getTaskActivityDescription(activity);

  return (
    <div className="flex gap-3">
      <div className="flex w-5 justify-center">
        <CircleDot className="mt-1 h-4 w-4 text-[#3370ff]" />
      </div>

      <div className="flex-1 rounded-[20px] border border-[#eef1f6] bg-[#fbfcff] px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-medium text-[#1f2329]">
            {activity.operator.name} · {actionLabel}
          </p>
          <p className="text-xs text-[#8b95a7]">{formatDateTime(activity.createdAt)}</p>
        </div>
        <p className="mt-1 text-sm text-[#646a73]">
          {activity.task.taskNo} · {activity.task.title}
        </p>
        {description ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4e5969]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
