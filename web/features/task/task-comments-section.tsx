"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { TaskCommentEditor } from "@/features/task/task-comment-editor";
import { TaskCommentItem } from "@/features/task/task-comment-item";
import {
  useCreateTaskCommentMutation,
  useDeleteTaskCommentMutation,
  useTaskCommentsQuery,
  useUpdateTaskCommentMutation,
} from "@/features/task/queries";
import { getCurrentUser } from "@/services/auth";
import { queryKeys } from "@/services/query-keys";

import type { ProjectMember } from "@/services/types";

type TaskCommentsSectionProps = {
  taskId: string;
  members: ProjectMember[];
};

export function TaskCommentsSection({ taskId, members }: TaskCommentsSectionProps) {
  const commentsQuery = useTaskCommentsQuery(taskId);
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
  });
  const createCommentMutation = useCreateTaskCommentMutation(taskId);
  const updateCommentMutation = useUpdateTaskCommentMutation(taskId);
  const deleteCommentMutation = useDeleteTaskCommentMutation(taskId);
  const [draft, setDraft] = useState("");
  const [mentionUserIds, setMentionUserIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateComment() {
    setErrorMessage("");

    try {
      await createCommentMutation.mutateAsync({
        content: draft.trim(),
        mentionUserIds,
      });
      setDraft("");
      setMentionUserIds([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "评论发送失败");
    }
  }

  async function handleUpdateComment(commentId: string, content: string, nextMentionUserIds?: string[]) {
    setErrorMessage("");

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        input: {
          content,
          mentionUserIds: nextMentionUserIds,
        },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "评论更新失败");
      throw error;
    }
  }

  function handleMentionSelect(memberId: string) {
    const member = members.find((item) => item.user.id === memberId);
    if (!member) {
      return;
    }

    const mentionMatch = draft.match(/(?:^|\s)@([^\s@]*)$/);
    const currentToken = mentionMatch?.[1] ?? "";
    setDraft((prev) => prev.replace(new RegExp(`@${currentToken}$`), `@${member.user.name} `));
    setMentionUserIds((prev) => Array.from(new Set([...prev, memberId])));
  }

  async function handleDeleteComment(commentId: string) {
    setErrorMessage("");

    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "评论删除失败");
    }
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-[#e8edf4] bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-[#1f2329]">
        <MessageSquareText className="h-4 w-4 text-[#3370ff]" />
        评论区
      </div>

      <TaskCommentEditor
        value={draft}
        onChange={setDraft}
        onSubmit={handleCreateComment}
        members={members}
        onMentionSelect={handleMentionSelect}
        isPending={createCommentMutation.isPending}
      />

      {errorMessage ? <p className="text-sm text-[#d83931]">{errorMessage}</p> : null}

      {commentsQuery.isLoading ? (
        <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm text-[#8b95a7]">
          正在加载评论...
        </div>
      ) : commentsQuery.isError ? (
        <div className="rounded-[20px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-5 text-sm text-[#d83931]">
          {commentsQuery.error.message}
        </div>
      ) : commentsQuery.data && commentsQuery.data.length > 0 ? (
        <div className="space-y-3">
          {commentsQuery.data.map((comment) => (
            <TaskCommentItem
              key={comment.id}
              comment={comment}
              canManage={currentUserQuery.data?.id === comment.userId}
              members={members}
              isUpdating={updateCommentMutation.isPending}
              isDeleting={deleteCommentMutation.isPending}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-5 text-sm leading-7 text-[#8b95a7]">
          还没有评论，先补一条上下文说明，让协作信息留在任务里。
        </div>
      )}
    </section>
  );
}
