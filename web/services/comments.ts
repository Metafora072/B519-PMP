import { apiRequest } from "@/lib/api";

import type {
  CreateCommentInput,
  TaskCommentRecord,
  UpdateCommentInput,
} from "./types";

export function getTaskComments(taskId: string) {
  return apiRequest<TaskCommentRecord[]>(`/api/tasks/${taskId}/comments`);
}

export function createTaskComment(taskId: string, input: CreateCommentInput) {
  return apiRequest<TaskCommentRecord, CreateCommentInput>(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body: input,
  });
}

export function updateTaskComment(commentId: string, input: UpdateCommentInput) {
  return apiRequest<TaskCommentRecord, UpdateCommentInput>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteTaskComment(commentId: string) {
  return apiRequest<{ message: string }>(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
}
