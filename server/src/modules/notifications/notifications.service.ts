import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { type UserProfile } from "../users/users.service";
import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto";

type NotificationTypeValue =
  | "TASK_ASSIGNED"
  | "TASK_REASSIGNED"
  | "COMMENT_MENTION"
  | "PROJECT_JOIN_REQUEST"
  | "PROJECT_JOIN_APPROVED"
  | "PROJECT_JOIN_REJECTED"
  | "PROJECT_INVITED"
  | "TASK_OVERDUE";

type NotificationRow = {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  title: string;
  content: string | null;
  relatedProjectId: string | null;
  relatedTaskId: string | null;
  actorId: string | null;
  isRead: boolean;
  metadataJson: Record<string, unknown> | null;
  createdAt: Date;
  actor: UserProfile | null;
  project: {
    id: string;
    name: string;
    projectKey: string;
  } | null;
  task: {
    id: string;
    taskNo: string;
    title: string;
  } | null;
};

type NotificationInput = {
  userId: bigint;
  type: NotificationTypeValue;
  title: string;
  content?: string | null;
  relatedProjectId?: bigint | null;
  relatedTaskId?: bigint | null;
  actorId?: bigint | null;
  metadataJson?: Prisma.InputJsonValue | null;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listNotifications(currentUserId: string, query: ListNotificationsQueryDto) {
    const userId = parseBigIntId(currentUserId, "userId");
    await this.syncOverdueNotifications(userId);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const whereClause = Prisma.sql`
      n.user_id = ${userId}
      ${query.unreadOnly ? Prisma.sql`AND n.is_read = false` : Prisma.empty}
    `;

    const [countRows, items] = await Promise.all([
      this.prisma.$queryRaw<Array<{ total: number }>>(Prisma.sql`
        SELECT COUNT(*)::int AS total
        FROM notifications n
        WHERE ${whereClause}
      `),
      this.prisma.$queryRaw<NotificationRow[]>(Prisma.sql`
        SELECT
          n.id::text AS id,
          n.user_id::text AS "userId",
          n.type::text AS type,
          n.title,
          n.content,
          n.related_project_id::text AS "relatedProjectId",
          n.related_task_id::text AS "relatedTaskId",
          n.actor_id::text AS "actorId",
          n.is_read AS "isRead",
          n.metadata_json AS "metadataJson",
          n.created_at AS "createdAt",
          CASE
            WHEN actor.id IS NULL THEN NULL
            ELSE json_build_object(
              'id', actor.id::text,
              'email', actor.email,
              'name', actor.name,
              'avatarUrl', actor.avatar_url,
              'status', actor.status::text,
              'createdAt', actor.created_at,
              'updatedAt', actor.updated_at
            )
          END AS actor,
          CASE
            WHEN p.id IS NULL THEN NULL
            ELSE json_build_object(
              'id', p.id::text,
              'name', p.name,
              'projectKey', p.project_key
            )
          END AS project,
          CASE
            WHEN t.id IS NULL THEN NULL
            ELSE json_build_object(
              'id', t.id::text,
              'taskNo', t.task_no,
              'title', t.title
            )
          END AS task
        FROM notifications n
        LEFT JOIN users actor ON actor.id = n.actor_id
        LEFT JOIN projects p ON p.id = n.related_project_id
        LEFT JOIN tasks t ON t.id = n.related_task_id
        WHERE ${whereClause}
        ORDER BY n.created_at DESC, n.id DESC
        OFFSET ${(page - 1) * pageSize}
        LIMIT ${pageSize}
      `),
    ]);

    const total = countRows[0]?.total ?? 0;

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async getUnreadCount(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    await this.syncOverdueNotifications(userId);

    const rows = await this.prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE user_id = ${userId}
        AND is_read = false
    `);

    return {
      count: rows[0]?.count ?? 0,
    };
  }

  async markNotificationRead(notificationIdParam: string, currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    const notificationId = parseBigIntId(notificationIdParam, "notificationId");

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId}
        AND user_id = ${userId}
    `);

    return {
      message: "通知已标记为已读",
    };
  }

  async markAllRead(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ${userId}
        AND is_read = false
    `);

    return {
      message: "已全部标记为已读",
    };
  }

  async createNotification(input: NotificationInput) {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        related_project_id,
        related_task_id,
        actor_id,
        is_read,
        metadata_json,
        created_at
      )
      VALUES (
        ${input.userId},
        CAST(${input.type} AS "NotificationType"),
        ${input.title},
        ${input.content ?? null},
        ${input.relatedProjectId ?? null},
        ${input.relatedTaskId ?? null},
        ${input.actorId ?? null},
        false,
        ${input.metadataJson ?? null}::jsonb,
        NOW()
      )
      RETURNING id::text AS id
    `);

    return rows[0] ?? null;
  }

  async createNotifications(inputs: NotificationInput[]) {
    for (const input of inputs) {
      await this.createNotification(input);
    }
  }

  async notifyProjectInvitation(params: {
    recipientUserId: bigint;
    actorId: bigint;
    projectId: bigint;
    projectName: string;
  }) {
    if (params.recipientUserId === params.actorId) {
      return;
    }

    await this.createNotification({
      userId: params.recipientUserId,
      type: "PROJECT_INVITED",
      title: `你被邀请加入项目「${params.projectName}」`,
      content: "进入项目列表即可接受邀请。",
      relatedProjectId: params.projectId,
      actorId: params.actorId,
    });
  }

  async notifyProjectJoinRequest(params: {
    recipientUserIds: bigint[];
    actorId: bigint;
    projectId: bigint;
    projectName: string;
    actorName: string;
  }) {
    const recipientUserIds = params.recipientUserIds.filter((userId) => userId !== params.actorId);
    await this.createNotifications(
      recipientUserIds.map((userId) => ({
        userId,
        type: "PROJECT_JOIN_REQUEST" as const,
        title: `${params.actorName} 申请加入项目「${params.projectName}」`,
        content: "请前往成员管理页审批。",
        relatedProjectId: params.projectId,
        actorId: params.actorId,
      })),
    );
  }

  async notifyProjectJoinDecision(params: {
    recipientUserId: bigint;
    actorId: bigint;
    projectId: bigint;
    projectName: string;
    approved: boolean;
  }) {
    if (params.recipientUserId === params.actorId) {
      return;
    }

    await this.createNotification({
      userId: params.recipientUserId,
      type: params.approved ? "PROJECT_JOIN_APPROVED" : "PROJECT_JOIN_REJECTED",
      title: params.approved
        ? `你加入项目「${params.projectName}」的申请已通过`
        : `你加入项目「${params.projectName}」的申请未通过`,
      content: params.approved ? "现在可以进入项目并参与协作。" : "可以联系项目负责人了解详情。",
      relatedProjectId: params.projectId,
      actorId: params.actorId,
    });
  }

  async notifyTaskAssignment(params: {
    recipientUserId: bigint | null;
    actorId: bigint;
    projectId: bigint;
    taskId: bigint;
    taskTitle: string;
    previousAssigneeId?: bigint | null;
  }) {
    if (!params.recipientUserId || params.recipientUserId === params.actorId) {
      return;
    }

    await this.createNotification({
      userId: params.recipientUserId,
      type: params.previousAssigneeId ? "TASK_REASSIGNED" : "TASK_ASSIGNED",
      title: `你被分配了任务「${params.taskTitle}」`,
      content: params.previousAssigneeId ? "任务负责人已更新到你。" : "请进入任务详情查看最新上下文。",
      relatedProjectId: params.projectId,
      relatedTaskId: params.taskId,
      actorId: params.actorId,
    });
  }

  async notifyCommentMentions(params: {
    recipientUserIds: bigint[];
    actorId: bigint;
    projectId: bigint;
    taskId: bigint;
    taskTitle: string;
    actorName: string;
    content: string;
  }) {
    const recipientUserIds = params.recipientUserIds.filter((userId) => userId !== params.actorId);
    if (!recipientUserIds.length) {
      return;
    }

    const preview =
      params.content.length > 120 ? `${params.content.slice(0, 117)}...` : params.content;

    await this.createNotifications(
      recipientUserIds.map((userId) => ({
        userId,
        type: "COMMENT_MENTION" as const,
        title: `${params.actorName} 在任务「${params.taskTitle}」中 @了你`,
        content: preview,
        relatedProjectId: params.projectId,
        relatedTaskId: params.taskId,
        actorId: params.actorId,
      })),
    );
  }

  private async syncOverdueNotifications(userId: bigint) {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const overdueTasks = await this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        deletedAt: null,
        dueAt: {
          lt: now,
        },
        status: {
          in: ["TODO", "IN_PROGRESS"],
        },
      },
      select: {
        id: true,
        title: true,
        projectId: true,
      },
    });

    if (!overdueTasks.length) {
      return;
    }

    const existing = await this.prisma.$queryRaw<Array<{ relatedTaskId: string | null }>>(Prisma.sql`
      SELECT related_task_id::text AS "relatedTaskId"
      FROM notifications
      WHERE user_id = ${userId}
        AND type = CAST('TASK_OVERDUE' AS "NotificationType")
        AND created_at >= ${startOfDay}
        AND related_task_id IN (${Prisma.join(overdueTasks.map((task) => task.id))})
    `);

    const existingTaskIds = new Set(existing.map((item: { relatedTaskId: string | null }) => item.relatedTaskId));
    const pendingInputs = overdueTasks
      .filter((task) => !existingTaskIds.has(task.id.toString()))
      .map((task) => ({
        userId,
        type: "TASK_OVERDUE" as const,
        title: `任务「${task.title}」已逾期`,
        content: "请尽快推进或调整截止时间。",
        relatedProjectId: task.projectId,
        relatedTaskId: task.id,
        metadataJson: { source: "daily-sync" } as Prisma.InputJsonValue,
      }));

    await this.createNotifications(pendingInputs);
  }
}
