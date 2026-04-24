"use client";

import { useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskCommentEditor } from "@/features/task/task-comment-editor";
import { formatDateTime, getInitials } from "@/lib/format";

import type { TaskCommentRecord } from "@/services/types";

type TaskCommentItemProps = {
  comment: TaskCommentRecord;
  canManage: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

export function TaskCommentItem({
  comment,
  canManage,
  isUpdating,
  isDeleting,
  onUpdate,
  onDelete,
}: TaskCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  async function handleSave() {
    await onUpdate(comment.id, draft.trim());
    setIsEditing(false);
  }

  return (
    <div className="rounded-[22px] border border-[#e8edf4] bg-[#fbfcff] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] text-xs font-semibold text-[#3370ff]">
            {getInitials(comment.user.name)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-[#1f2329]">{comment.user.name}</p>
              <p className="text-xs text-[#8b95a7]">{formatDateTime(comment.createdAt)}</p>
              {comment.updatedAt !== comment.createdAt ? (
                <span className="text-xs text-[#8b95a7]">已编辑</span>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-3">
                <TaskCommentEditor
                  value={draft}
                  onChange={setDraft}
                  onSubmit={handleSave}
                  isPending={isUpdating}
                  submitLabel="保存评论"
                  onCancel={() => {
                    setDraft(comment.content);
                    setIsEditing(false);
                  }}
                />
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4e5969]">{comment.content}</p>
            )}
          </div>
        </div>

        {canManage && !isEditing ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3"
              onClick={() => setIsEditing(true)}
            >
              <PencilLine className="mr-1.5 h-3.5 w-3.5" />
              编辑
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-[#d83931] hover:bg-[#fff1ef] hover:text-[#d83931]"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {isDeleting ? "删除中" : "删除"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
