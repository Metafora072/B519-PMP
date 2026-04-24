import { getTaskPriorityLabel, getTaskStatusLabel } from "@/features/task/constants";

import type { TaskActivityRecord } from "@/services/types";

const ACTION_LABELS: Record<string, string> = {
  create_task: "创建任务",
  update_title: "修改标题",
  update_description: "修改描述",
  update_status: "修改状态",
  update_priority: "修改优先级",
  update_assignee: "修改负责人",
  delete_task: "删除任务",
  create_comment: "添加评论",
  update_comment: "修改评论",
  delete_comment: "删除评论",
};

function getReadableValue(actionType: string, value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  if (actionType === "update_status") {
    return getTaskStatusLabel(value as never);
  }

  if (actionType === "update_priority") {
    return getTaskPriorityLabel(value as never);
  }

  return value;
}

export function getTaskActivityActionLabel(actionType: string) {
  return ACTION_LABELS[actionType] ?? actionType;
}

export function getTaskActivityDescription(activity: TaskActivityRecord) {
  const detail = activity.actionDetail ?? {};

  if ("before" in detail || "after" in detail) {
    const before = getReadableValue(activity.actionType, detail.before);
    const after = getReadableValue(activity.actionType, detail.after);

    if (before || after) {
      return `${before ?? "空"} -> ${after ?? "空"}`;
    }
  }

  if (activity.actionType === "create_comment" && typeof detail.content === "string") {
    return detail.content;
  }

  if (activity.actionType === "delete_comment" && typeof detail.content === "string") {
    return detail.content;
  }

  return null;
}
