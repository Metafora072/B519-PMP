import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { normalizeOptionalString } from "../../common/utils/normalize-string";
import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { userProfileSelect } from "../users/users.service";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";

const projectModuleSelect = {
  id: true,
  projectId: true,
  name: true,
  description: true,
  color: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: userProfileSelect,
  },
  project: {
    select: {
      id: true,
      name: true,
      projectKey: true,
    },
  },
  _count: {
    select: {
      tasks: {
        where: {
          deletedAt: null,
        },
      },
    },
  },
} satisfies Prisma.ModuleSelect;

@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async listProjectModules(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.projectsService.assertProjectMember(projectId, currentUserId);

    return this.prisma.module.findMany({
      where: {
        projectId,
      },
      select: projectModuleSelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  async createProjectModule(projectIdParam: string, currentUserId: string, dto: CreateModuleDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.projectsService.assertProjectAdmin(projectId, currentUserId);

    const ownerId = dto.ownerId ? parseBigIntId(dto.ownerId, "ownerId") : parseBigIntId(currentUserId, "userId");
    await this.projectsService.assertUserIsProjectMember(projectId, ownerId);

    const existingModule = await this.prisma.module.findFirst({
      where: {
        projectId,
        name: dto.name,
      },
      select: { id: true },
    });

    if (existingModule) {
      throw new ConflictException("模块名称已存在");
    }

    return this.prisma.module.create({
      data: {
        projectId,
        name: dto.name,
        description: normalizeOptionalString(dto.description),
        ownerId,
        color: normalizeOptionalString(dto.color),
        sortOrder: dto.sortOrder ?? 0,
      },
      select: projectModuleSelect,
    });
  }

  async getModuleById(moduleIdParam: string, currentUserId: string) {
    const moduleId = parseBigIntId(moduleIdParam, "moduleId");
    const moduleEntity = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      select: {
        id: true,
        projectId: true,
      },
    });

    if (!moduleEntity) {
      throw new NotFoundException("模块不存在");
    }

    await this.projectsService.assertProjectMember(moduleEntity.projectId, currentUserId);

    return this.prisma.module.findUniqueOrThrow({
      where: {
        id: moduleId,
      },
      select: projectModuleSelect,
    });
  }

  async updateModule(moduleIdParam: string, currentUserId: string, dto: UpdateModuleDto) {
    const moduleId = parseBigIntId(moduleIdParam, "moduleId");
    const moduleEntity = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      select: {
        id: true,
        projectId: true,
        ownerId: true,
      },
    });

    if (!moduleEntity) {
      throw new NotFoundException("模块不存在");
    }

    const userId = parseBigIntId(currentUserId, "userId");
    try {
      await this.projectsService.assertProjectAdmin(moduleEntity.projectId, currentUserId);
    } catch (error) {
      if (!(error instanceof ForbiddenException) || moduleEntity.ownerId !== userId) {
        throw error;
      }
    }

    if (dto.ownerId) {
      await this.projectsService.assertUserIsProjectMember(
        moduleEntity.projectId,
        parseBigIntId(dto.ownerId, "ownerId"),
      );
    }

    if (dto.name) {
      const duplicateModule = await this.prisma.module.findFirst({
        where: {
          id: {
            not: moduleId,
          },
          projectId: moduleEntity.projectId,
          name: dto.name,
        },
        select: {
          id: true,
        },
      });

      if (duplicateModule) {
        throw new ConflictException("模块名称已存在");
      }
    }

    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: normalizeOptionalString(dto.description) } : {}),
        ...(dto.color !== undefined ? { color: normalizeOptionalString(dto.color) } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.ownerId ? { ownerId: parseBigIntId(dto.ownerId, "ownerId") } : {}),
      },
      select: projectModuleSelect,
    });
  }

  async deleteModule(moduleIdParam: string, currentUserId: string) {
    const moduleId = parseBigIntId(moduleIdParam, "moduleId");
    const moduleEntity = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      select: {
        id: true,
        projectId: true,
        _count: {
          select: {
            tasks: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!moduleEntity) {
      throw new NotFoundException("模块不存在");
    }

    await this.projectsService.assertProjectAdmin(moduleEntity.projectId, currentUserId);

    if (moduleEntity._count.tasks > 0) {
      throw new BadRequestException("当前模块下仍存在任务，无法删除");
    }

    await this.prisma.module.delete({
      where: {
        id: moduleId,
      },
    });

    return {
      message: "模块删除成功",
    };
  }
}

