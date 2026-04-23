import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  ProjectRole,
  ProjectStatus,
  ProjectVisibility,
} from "@prisma/client";

import { normalizeOptionalString } from "../../common/utils/normalize-string";
import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService, userProfileSelect } from "../users/users.service";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

const projectSummarySelect = {
  id: true,
  name: true,
  projectKey: true,
  description: true,
  icon: true,
  status: true,
  visibility: true,
  taskSeq: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: userProfileSelect,
  },
  members: {
    select: {
      id: true,
      role: true,
      userId: true,
    },
  },
  _count: {
    select: {
      modules: true,
      tasks: {
        where: {
          deletedAt: null,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

const projectMemberSelect = {
  id: true,
  role: true,
  createdAt: true,
  user: {
    select: userProfileSelect,
  },
} satisfies Prisma.ProjectMemberSelect;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async listProjects(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");

    return this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: projectSummarySelect,
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async createProject(currentUserId: string, dto: CreateProjectDto) {
    const ownerId = parseBigIntId(currentUserId, "userId");

    const existingProject = await this.prisma.project.findUnique({
      where: { projectKey: dto.projectKey },
      select: { id: true },
    });

    if (existingProject) {
      throw new ConflictException("项目标识已存在");
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: dto.name,
          projectKey: dto.projectKey,
          description: normalizeOptionalString(dto.description),
          icon: normalizeOptionalString(dto.icon),
          status: dto.status ?? ProjectStatus.ACTIVE,
          visibility: dto.visibility ?? ProjectVisibility.PRIVATE,
          ownerId,
        },
        select: {
          id: true,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: ownerId,
          role: ProjectRole.PROJECT_ADMIN,
        },
      });

      return tx.project.findUniqueOrThrow({
        where: {
          id: project.id,
        },
        select: projectSummarySelect,
      });
    });
  }

  async getProjectById(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectMember(projectId, currentUserId);

    return this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: {
        ...projectSummarySelect,
        members: {
          select: projectMemberSelect,
        },
      },
    });
  }

  async updateProject(projectIdParam: string, currentUserId: string, dto: UpdateProjectDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectAdmin(projectId, currentUserId);

    if (dto.projectKey) {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          projectKey: dto.projectKey,
          id: {
            not: projectId,
          },
        },
        select: { id: true },
      });

      if (existingProject) {
        throw new ConflictException("项目标识已存在");
      }
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.projectKey ? { projectKey: dto.projectKey } : {}),
        ...(dto.description !== undefined ? { description: normalizeOptionalString(dto.description) } : {}),
        ...(dto.icon !== undefined ? { icon: normalizeOptionalString(dto.icon) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.visibility ? { visibility: dto.visibility } : {}),
      },
      select: projectSummarySelect,
    });
  }

  async deleteProject(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectAdmin(projectId, currentUserId);

    await this.prisma.$transaction(async (tx) => {
      await tx.taskLabel.deleteMany({
        where: {
          task: {
            projectId,
          },
        },
      });
      await tx.taskComment.deleteMany({
        where: {
          task: {
            projectId,
          },
        },
      });
      await tx.taskActivityLog.deleteMany({
        where: {
          projectId,
        },
      });
      await tx.task.deleteMany({
        where: {
          projectId,
        },
      });
      await tx.label.deleteMany({
        where: {
          projectId,
        },
      });
      await tx.module.deleteMany({
        where: {
          projectId,
        },
      });
      await tx.projectMember.deleteMany({
        where: {
          projectId,
        },
      });
      await tx.project.delete({
        where: {
          id: projectId,
        },
      });
    });

    return {
      message: "项目删除成功",
    };
  }

  async listProjectMembers(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectMember(projectId, currentUserId);

    return this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      select: projectMemberSelect,
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" },
      ],
    });
  }

  async addProjectMember(projectIdParam: string, currentUserId: string, dto: AddProjectMemberDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const targetUserId = parseBigIntId(dto.userId, "userId");
    const targetUser = await this.usersService.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException("目标用户不存在");
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
      select: { id: true },
    });

    if (existingMember) {
      throw new ConflictException("该用户已是项目成员");
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUserId,
        role: dto.role,
      },
      select: projectMemberSelect,
    });
  }

  async assertProjectMember(projectId: bigint, currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");

    const membership = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!membership) {
      const projectExists = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!projectExists) {
        throw new NotFoundException("项目不存在");
      }

      throw new ForbiddenException("非项目成员无权访问该项目");
    }

    return membership;
  }

  async assertProjectAdmin(projectId: bigint, currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        ownerId: true,
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException("项目不存在");
    }

    const memberRole = project.members[0]?.role;
    const isAdmin = project.ownerId === userId || memberRole === ProjectRole.PROJECT_ADMIN;

    if (!isAdmin) {
      throw new ForbiddenException("当前用户无项目管理权限");
    }

    return project;
  }

  async assertProjectMemberByParam(projectIdParam: string, currentUserId: string) {
    return this.assertProjectMember(parseBigIntId(projectIdParam, "projectId"), currentUserId);
  }

  async assertProjectAdminByParam(projectIdParam: string, currentUserId: string) {
    return this.assertProjectAdmin(parseBigIntId(projectIdParam, "projectId"), currentUserId);
  }

  async assertUserIsProjectMember(projectId: bigint, userId: bigint) {
    const userMembership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!userMembership) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!project) {
        throw new NotFoundException("项目不存在");
      }

      if (project.ownerId !== userId) {
        throw new BadRequestException("目标用户不是项目成员");
      }
    }
  }
}

