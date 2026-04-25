import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ProjectsService } from "../projects/projects.service";
import { userProfileSelect } from "../users/users.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

const taskCommentSelect = {
  id: true,
  taskId: true,
  userId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: userProfileSelect,
  },
} satisfies Prisma.TaskCommentSelect;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listTaskComments(taskIdParam: string, currentUserId: string) {
    const task = await this.getAccessibleTask(taskIdParam, currentUserId);

    return this.prisma.taskComment.findMany({
      where: {
        taskId: task.id,
      },
      select: taskCommentSelect,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  }

  async createTaskComment(taskIdParam: string, currentUserId: string, dto: CreateCommentDto) {
    const task = await this.getAccessibleTask(taskIdParam, currentUserId);
    const userId = parseBigIntId(currentUserId, "userId");
    const mentionUserIds = await this.resolveMentionUserIds(task.projectId, dto.mentionUserIds);
    const operator = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      },
    });

    const comment = await this.prisma.$transaction(async (tx) => {
      const comment = await tx.taskComment.create({
        data: {
          taskId: task.id,
          userId,
          content: dto.content,
        },
        select: taskCommentSelect,
      });

      await tx.taskActivityLog.create({
        data: {
          projectId: task.projectId,
          taskId: task.id,
          operatorId: userId,
          actionType: "create_comment",
          actionDetail: {
            commentId: comment.id.toString(),
            content: comment.content,
            mentionUserIds: mentionUserIds.map((item) => item.toString()),
          } as Prisma.InputJsonValue,
        },
      });

      return comment;
    });

    await this.notificationsService.notifyCommentMentions({
      recipientUserIds: mentionUserIds,
      actorId: userId,
      actorName: operator.name,
      projectId: task.projectId,
      taskId: task.id,
      taskTitle: task.title,
      content: comment.content,
    });

    return comment;
  }

  async updateComment(commentIdParam: string, currentUserId: string, dto: UpdateCommentDto) {
    const comment = await this.getAccessibleComment(commentIdParam, currentUserId);
    await this.assertCommentEditable(comment.task.projectId, currentUserId, comment.userId);
    const operatorId = parseBigIntId(currentUserId, "userId");
    const mentionUserIds = await this.resolveMentionUserIds(comment.task.projectId, dto.mentionUserIds);

    if (comment.content === dto.content) {
      return this.prisma.taskComment.findUniqueOrThrow({
        where: { id: comment.id },
        select: taskCommentSelect,
      });
    }

    const updatedComment = await this.prisma.$transaction(async (tx) => {
      const updatedComment = await tx.taskComment.update({
        where: {
          id: comment.id,
        },
        data: {
          content: dto.content,
        },
        select: taskCommentSelect,
      });

      await tx.taskActivityLog.create({
        data: {
          projectId: comment.task.projectId,
          taskId: comment.task.id,
          operatorId,
          actionType: "update_comment",
          actionDetail: {
            commentId: comment.id.toString(),
            before: comment.content,
            after: updatedComment.content,
            mentionUserIds: mentionUserIds.map((item) => item.toString()),
          } as Prisma.InputJsonValue,
        },
      });

      return updatedComment;
    });

    const operator = await this.prisma.user.findUniqueOrThrow({
      where: { id: operatorId },
      select: {
        id: true,
        name: true,
      },
    });

    await this.notificationsService.notifyCommentMentions({
      recipientUserIds: mentionUserIds,
      actorId: operatorId,
      actorName: operator.name,
      projectId: comment.task.projectId,
      taskId: comment.task.id,
      taskTitle: comment.task.title,
      content: updatedComment.content,
    });

    return updatedComment;
  }

  async deleteComment(commentIdParam: string, currentUserId: string) {
    const comment = await this.getAccessibleComment(commentIdParam, currentUserId);
    await this.assertCommentEditable(comment.task.projectId, currentUserId, comment.userId);

    const operatorId = parseBigIntId(currentUserId, "userId");

    await this.prisma.$transaction(async (tx) => {
      await tx.taskComment.delete({
        where: {
          id: comment.id,
        },
      });

      await tx.taskActivityLog.create({
        data: {
          projectId: comment.task.projectId,
          taskId: comment.task.id,
          operatorId,
          actionType: "delete_comment",
          actionDetail: {
            commentId: comment.id.toString(),
            content: comment.content,
          } as Prisma.InputJsonValue,
        },
      });
    });

    return {
      message: "评论删除成功",
    };
  }

  private async getAccessibleTask(taskIdParam: string, currentUserId: string) {
    const taskId = parseBigIntId(taskIdParam, "taskId");
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        title: true,
      },
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    await this.projectsService.assertProjectMember(task.projectId, currentUserId);
    return task;
  }

  private async getAccessibleComment(commentIdParam: string, currentUserId: string) {
    const commentId = parseBigIntId(commentIdParam, "commentId");
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        content: true,
        task: {
          select: {
            id: true,
            projectId: true,
            title: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException("评论不存在");
    }

    await this.projectsService.assertProjectMember(comment.task.projectId, currentUserId);
    return comment;
  }

  private async assertCommentEditable(projectId: bigint, currentUserId: string, authorId: bigint) {
    const operatorId = parseBigIntId(currentUserId, "userId");

    if (authorId === operatorId) {
      return;
    }

    await this.projectsService.assertProjectAdmin(projectId, currentUserId);
  }

  private async resolveMentionUserIds(projectId: bigint, mentionUserIds?: string[]) {
    if (!mentionUserIds?.length) {
      return [];
    }

    const uniqueIds = Array.from(new Set(mentionUserIds.map((item) => parseBigIntId(item, "mentionUserId"))));
    for (const userId of uniqueIds) {
      await this.projectsService.assertUserIsProjectMember(projectId, userId);
    }

    return uniqueIds;
  }
}
