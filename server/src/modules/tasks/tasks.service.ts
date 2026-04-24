import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TaskPriority, TaskStatus, TaskType } from "@prisma/client";

import { normalizeOptionalString } from "../../common/utils/normalize-string";
import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { ModulesService } from "../modules/modules.service";
import { ProjectsService } from "../projects/projects.service";
import { userProfileSelect } from "../users/users.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { ListProjectTasksDto } from "./dto/list-project-tasks.dto";
import { UpdateTaskAssigneeDto } from "./dto/update-task-assignee.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskPriorityDto } from "./dto/update-task-priority.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";

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

type TaskRecord = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly modulesService: ModulesService,
  ) {}

  async listProjectTasks(projectIdParam: string, currentUserId: string, query: ListProjectTasksDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.projectsService.assertProjectMember(projectId, currentUserId);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const keyword = query.keyword?.trim();

    const where = {
      projectId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.moduleId
        ? query.moduleId === "none"
          ? { moduleId: null as never }
          : { moduleId: parseBigIntId(query.moduleId, "moduleId") }
        : {}),
      ...(query.assigneeId ? { assigneeId: parseBigIntId(query.assigneeId, "assigneeId") } : {}),
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: "insensitive" } },
              { description: { contains: keyword, mode: "insensitive" } },
              { taskNo: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {}),
    } satisfies Prisma.TaskWhereInput;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        select: taskSelect,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
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

  async createTask(projectIdParam: string, currentUserId: string, dto: CreateTaskDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const creatorId = parseBigIntId(currentUserId, "userId");
    await this.projectsService.assertProjectMember(projectId, currentUserId);

    const moduleId = dto.moduleId ? parseBigIntId(dto.moduleId, "moduleId") : null;
    if (dto.moduleId) {
      await this.ensureModuleBelongsToProject(dto.moduleId, projectId, currentUserId);
    }

    const assigneeId = dto.assigneeId ? parseBigIntId(dto.assigneeId, "assigneeId") : null;
    if (assigneeId) {
      await this.projectsService.assertUserIsProjectMember(projectId, assigneeId);
    }

    const parentTaskId = dto.parentTaskId ? parseBigIntId(dto.parentTaskId, "parentTaskId") : null;
    if (parentTaskId) {
      await this.ensureParentTaskBelongsToProject(parentTaskId, projectId);
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id: projectId },
        data: {
          taskSeq: {
            increment: 1,
          },
        },
        select: {
          projectKey: true,
          taskSeq: true,
        },
      });

      const task = await tx.task.create({
        data: {
          projectId,
          moduleId: moduleId as never,
          taskNo: `${project.projectKey}-${project.taskSeq}`,
          title: dto.title,
          description: normalizeOptionalString(dto.description),
          type: dto.type ?? TaskType.REQUIREMENT,
          status: dto.status ?? TaskStatus.TODO,
          priority: dto.priority ?? TaskPriority.P2,
          creatorId,
          assigneeId,
          parentTaskId,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          startAt: dto.startAt ? new Date(dto.startAt) : null,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
          repoName: normalizeOptionalString(dto.repoName),
          branchName: normalizeOptionalString(dto.branchName),
          prUrl: normalizeOptionalString(dto.prUrl),
          issueUrl: normalizeOptionalString(dto.issueUrl),
          estimateHours: dto.estimateHours ?? null,
        } as Prisma.TaskUncheckedCreateInput,
        select: taskSelect,
      });

      await tx.taskActivityLog.create({
        data: {
          projectId,
          taskId: task.id,
          operatorId: creatorId,
          actionType: "create_task",
          actionDetail: {
            taskNo: task.taskNo,
            title: task.title,
          } as Prisma.InputJsonValue,
        },
      });

      return task;
    });
  }

  async getTaskById(taskIdParam: string, currentUserId: string) {
    const task = await this.getActiveTaskEntity(taskIdParam);
    await this.projectsService.assertProjectMember(task.projectId, currentUserId);

    return this.prisma.task.findUniqueOrThrow({
      where: {
        id: task.id,
      },
      select: taskSelect,
    });
  }

  async updateTask(taskIdParam: string, currentUserId: string, dto: UpdateTaskDto) {
    const task = await this.getActiveTaskEntity(taskIdParam);
    await this.projectsService.assertProjectMember(task.projectId, currentUserId);

    if (dto.moduleId) {
      await this.ensureModuleBelongsToProject(dto.moduleId, task.projectId, currentUserId);
    }

    const assigneeId = dto.assigneeId ? parseBigIntId(dto.assigneeId, "assigneeId") : undefined;
    if (assigneeId) {
      await this.projectsService.assertUserIsProjectMember(task.projectId, assigneeId);
    }

    const parentTaskId = dto.parentTaskId ? parseBigIntId(dto.parentTaskId, "parentTaskId") : undefined;
    if (parentTaskId) {
      if (parentTaskId === task.id) {
        throw new BadRequestException("父任务不能是当前任务自身");
      }

      await this.ensureParentTaskBelongsToProject(parentTaskId, task.projectId);
    }

    const nextStatus = dto.status ?? task.status;
    const completedAt = this.resolveCompletedAt(nextStatus, task.completedAt, dto.completedAt);

    const updatedTask = await this.prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        ...(dto.moduleId !== undefined
          ? { moduleId: (dto.moduleId ? parseBigIntId(dto.moduleId, "moduleId") : null) as never }
          : {}),
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: normalizeOptionalString(dto.description) } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(dto.assigneeId !== undefined ? { assigneeId: assigneeId ?? null } : {}),
        ...(dto.parentTaskId !== undefined ? { parentTaskId: parentTaskId ?? null } : {}),
        ...(dto.dueAt !== undefined ? { dueAt: dto.dueAt ? new Date(dto.dueAt) : null } : {}),
        ...(dto.startAt !== undefined ? { startAt: dto.startAt ? new Date(dto.startAt) : null } : {}),
        ...(dto.completedAt !== undefined || dto.status ? { completedAt } : {}),
        ...(dto.repoName !== undefined ? { repoName: normalizeOptionalString(dto.repoName) } : {}),
        ...(dto.branchName !== undefined ? { branchName: normalizeOptionalString(dto.branchName) } : {}),
        ...(dto.prUrl !== undefined ? { prUrl: normalizeOptionalString(dto.prUrl) } : {}),
        ...(dto.issueUrl !== undefined ? { issueUrl: normalizeOptionalString(dto.issueUrl) } : {}),
        ...(dto.estimateHours !== undefined ? { estimateHours: dto.estimateHours } : {}),
      } as Prisma.TaskUncheckedUpdateInput,
      select: taskSelect,
    });

    await this.logTaskMutations({
      before: task,
      after: updatedTask,
      operatorId: parseBigIntId(currentUserId, "userId"),
    });

    return updatedTask;
  }

  async deleteTask(taskIdParam: string, currentUserId: string) {
    const task = await this.getActiveTaskEntity(taskIdParam);
    await this.projectsService.assertProjectAdmin(task.projectId, currentUserId);

    const operatorId = parseBigIntId(currentUserId, "userId");

    await this.prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: {
          id: task.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.taskActivityLog.create({
        data: {
          projectId: task.projectId,
          taskId: task.id,
          operatorId,
          actionType: "delete_task",
          actionDetail: {
            taskNo: task.taskNo,
            title: task.title,
          } as Prisma.InputJsonValue,
        },
      });
    });

    return {
      message: "任务删除成功",
    };
  }

  async updateTaskStatus(taskIdParam: string, currentUserId: string, dto: UpdateTaskStatusDto) {
    return this.updateTask(taskIdParam, currentUserId, {
      status: dto.status,
    });
  }

  async updateTaskPriority(taskIdParam: string, currentUserId: string, dto: UpdateTaskPriorityDto) {
    return this.updateTask(taskIdParam, currentUserId, {
      priority: dto.priority,
    });
  }

  async updateTaskAssignee(taskIdParam: string, currentUserId: string, dto: UpdateTaskAssigneeDto) {
    const task = await this.getActiveTaskEntity(taskIdParam);
    await this.projectsService.assertProjectMember(task.projectId, currentUserId);

    if (dto.assigneeId === undefined) {
      throw new BadRequestException("assigneeId 不能为空，取消负责人请传 null");
    }

    const nextAssigneeId =
      dto.assigneeId === null ? null : parseBigIntId(dto.assigneeId, "assigneeId");

    if (nextAssigneeId) {
      await this.projectsService.assertUserIsProjectMember(task.projectId, nextAssigneeId);
    }

    const updatedTask = await this.prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        assigneeId: nextAssigneeId,
      },
      select: taskSelect,
    });

    await this.logTaskMutations({
      before: task,
      after: updatedTask,
      operatorId: parseBigIntId(currentUserId, "userId"),
    });

    return updatedTask;
  }

  private async getActiveTaskEntity(taskIdParam: string) {
    const taskId = parseBigIntId(taskIdParam, "taskId");
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
      select: taskSelect,
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    return task;
  }

  private async ensureModuleBelongsToProject(
    moduleIdParam: string,
    projectId: bigint,
    currentUserId: string,
  ) {
    const moduleId = parseBigIntId(moduleIdParam, "moduleId");
    const moduleEntity = await this.modulesService.getModuleById(moduleId.toString(), currentUserId);
    if (moduleEntity.projectId !== projectId) {
      throw new BadRequestException("模块不属于当前项目");
    }
  }

  private async ensureParentTaskBelongsToProject(parentTaskId: bigint, projectId: bigint) {
    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: parentTaskId,
        projectId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!parentTask) {
      throw new BadRequestException("父任务不存在或不属于当前项目");
    }
  }

  private resolveCompletedAt(
    nextStatus: TaskStatus,
    previousCompletedAt: Date | null,
    explicitCompletedAt?: string,
  ) {
    if (explicitCompletedAt !== undefined) {
      return explicitCompletedAt ? new Date(explicitCompletedAt) : null;
    }

    if (nextStatus === TaskStatus.DONE || nextStatus === TaskStatus.CLOSED) {
      return previousCompletedAt ?? new Date();
    }

    return null;
  }

  private async logTaskMutations(params: {
    before: TaskRecord;
    after: TaskRecord;
    operatorId: bigint;
  }) {
    const { before, after, operatorId } = params;
    const logs: Prisma.TaskActivityLogCreateManyInput[] = [];

    if (before.title !== after.title) {
      logs.push({
        projectId: after.projectId,
        taskId: after.id,
        operatorId,
        actionType: "update_title",
        actionDetail: {
          before: before.title,
          after: after.title,
        } as Prisma.InputJsonValue,
      });
    }

    if ((before.description ?? null) !== (after.description ?? null)) {
      logs.push({
        projectId: after.projectId,
        taskId: after.id,
        operatorId,
        actionType: "update_description",
        actionDetail: {
          before: before.description,
          after: after.description,
        } as Prisma.InputJsonValue,
      });
    }

    if (before.status !== after.status) {
      logs.push({
        projectId: after.projectId,
        taskId: after.id,
        operatorId,
        actionType: "update_status",
        actionDetail: {
          before: before.status,
          after: after.status,
        } as Prisma.InputJsonValue,
      });
    }

    if (before.priority !== after.priority) {
      logs.push({
        projectId: after.projectId,
        taskId: after.id,
        operatorId,
        actionType: "update_priority",
        actionDetail: {
          before: before.priority,
          after: after.priority,
        } as Prisma.InputJsonValue,
      });
    }

    if ((before.assigneeId?.toString() ?? null) !== (after.assigneeId?.toString() ?? null)) {
      logs.push({
        projectId: after.projectId,
        taskId: after.id,
        operatorId,
        actionType: "update_assignee",
        actionDetail: {
          before: before.assigneeId?.toString() ?? null,
          after: after.assigneeId?.toString() ?? null,
        } as Prisma.InputJsonValue,
      });
    }

    if (logs.length > 0) {
      await this.prisma.taskActivityLog.createMany({
        data: logs,
      });
    }
  }
}
