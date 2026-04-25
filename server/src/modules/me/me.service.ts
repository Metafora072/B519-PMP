import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { userProfileSelect } from "../users/users.service";
import { ListMyTasksQueryDto } from "./dto/list-my-tasks-query.dto";

const taskSelect = {
  id: true,
  projectId: true,
  moduleId: true,
  taskNo: true,
  parentTaskId: true,
  title: true,
  description: true,
  type: true,
  status: true,
  priority: true,
  creatorId: true,
  assigneeId: true,
  dueAt: true,
  startAt: true,
  completedAt: true,
  repoName: true,
  branchName: true,
  prUrl: true,
  issueUrl: true,
  estimateHours: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: userProfileSelect,
  },
  assignee: {
    select: userProfileSelect,
  },
  module: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
  project: {
    select: {
      id: true,
      name: true,
      projectKey: true,
    },
  },
} satisfies Prisma.TaskSelect;

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkbenchSummary(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    const now = new Date();
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const [
      assigned,
      created,
      overdue,
      dueToday,
      highPriority,
      pendingActions,
    ] = await Promise.all([
      this.prisma.task.count({
        where: this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
        }),
      }),
      this.prisma.task.count({
        where: this.buildTaskVisibilityWhere(userId, {
          creatorId: userId,
        }),
      }),
      this.prisma.task.count({
        where: this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
          dueAt: { lt: now },
          status: { in: ["TODO", "IN_PROGRESS"] },
        }),
      }),
      this.prisma.task.count({
        where: this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
          dueAt: { gte: now, lt: endOfToday },
          status: { in: ["TODO", "IN_PROGRESS"] },
        }),
      }),
      this.prisma.task.count({
        where: this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
          priority: { in: ["P0", "P1"] },
          status: { in: ["TODO", "IN_PROGRESS"] },
        }),
      }),
      this.prisma.projectMember.count({
        where: {
          status: "PENDING",
          project: {
            members: {
              some: {
                userId,
                status: "ACTIVE",
                role: { in: ["OWNER", "ADMIN"] },
              },
            },
          },
        },
      }),
    ]);

    return {
      assigned,
      created,
      watching: 0,
      pendingActions,
      overdue,
      dueToday,
      highPriority,
    };
  }

  async listMyTasks(currentUserId: string, query: ListMyTasksQueryDto) {
    const userId = parseBigIntId(currentUserId, "userId");
    const now = new Date();
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    let where: Prisma.TaskWhereInput;

    switch (query.scope) {
      case "assigned":
        where = this.buildTaskVisibilityWhere(userId, { assigneeId: userId });
        break;
      case "created":
        where = this.buildTaskVisibilityWhere(userId, { creatorId: userId });
        break;
      case "watching":
        where = this.buildTaskVisibilityWhere(userId, { id: { in: [] } });
        break;
      case "overdue":
        where = this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
          dueAt: { lt: now },
          status: { in: ["TODO", "IN_PROGRESS"] },
        });
        break;
      case "dueToday":
        where = this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
          dueAt: { gte: now, lt: endOfToday },
          status: { in: ["TODO", "IN_PROGRESS"] },
        });
        break;
      case "highPriority":
      default:
        where = this.buildTaskVisibilityWhere(userId, {
          assigneeId: userId,
          priority: { in: ["P0", "P1"] },
          status: { in: ["TODO", "IN_PROGRESS"] },
        });
        break;
    }

    return this.prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy: [
        { dueAt: "asc" },
        { priority: "asc" },
        { updatedAt: "desc" },
        { id: "desc" },
      ],
      take: 30,
    });
  }

  async getPendingActions(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");

    const pendingMembers = await this.prisma.projectMember.findMany({
      where: {
        status: "PENDING",
        project: {
          members: {
            some: {
              userId,
              status: "ACTIVE",
              role: { in: ["OWNER", "ADMIN"] },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        user: {
          select: userProfileSelect,
        },
        project: {
          select: {
            id: true,
            name: true,
            projectKey: true,
          },
        },
      },
      take: 30,
    });

    return pendingMembers.map((member) => ({
      id: member.id,
      type: "PROJECT_JOIN_REQUEST",
      createdAt: member.createdAt,
      project: member.project,
      requester: member.user,
      membershipId: member.id,
    }));
  }

  private buildTaskVisibilityWhere(
    userId: bigint,
    extra: Prisma.TaskWhereInput,
  ): Prisma.TaskWhereInput {
    return {
      deletedAt: null,
      project: {
        members: {
          some: {
            userId,
            status: "ACTIVE",
          },
        },
      },
      ...extra,
    };
  }
}
