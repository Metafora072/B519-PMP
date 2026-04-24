import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { userProfileSelect } from "../users/users.service";
import { ListActivitiesQueryDto } from "./dto/list-activities-query.dto";

const activityLogSelect = {
  id: true,
  projectId: true,
  taskId: true,
  operatorId: true,
  actionType: true,
  actionDetail: true,
  createdAt: true,
  operator: {
    select: userProfileSelect,
  },
  task: {
    select: {
      id: true,
      taskNo: true,
      title: true,
    },
  },
} satisfies Prisma.TaskActivityLogSelect;

@Injectable()
export class ActivityLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async listTaskActivities(taskIdParam: string, currentUserId: string, query: ListActivitiesQueryDto) {
    const task = await this.getAccessibleTask(taskIdParam, currentUserId);
    return this.listActivities({ taskId: task.id }, query);
  }

  async listProjectActivities(
    projectIdParam: string,
    currentUserId: string,
    query: ListActivitiesQueryDto,
  ) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.projectsService.assertProjectMember(projectId, currentUserId);

    return this.listActivities({ projectId }, query);
  }

  private async listActivities(where: Prisma.TaskActivityLogWhereInput, query: ListActivitiesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.taskActivityLog.count({ where }),
      this.prisma.taskActivityLog.findMany({
        where,
        select: activityLogSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

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
      },
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    await this.projectsService.assertProjectMember(task.projectId, currentUserId);
    return task;
  }
}
