import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProjectStatus } from "@prisma/client";

import { normalizeOptionalString } from "../../common/utils/normalize-string";
import { parseBigIntId } from "../../common/utils/parse-bigint-id";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService, type UserProfile } from "../users/users.service";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { InviteProjectMemberDto } from "./dto/invite-project-member.dto";
import { UpdateProjectMemberRoleDto } from "./dto/update-project-member-role.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import {
  type JoinPolicyValue,
  type ProjectMemberStatusValue,
  type ProjectRoleValue,
  type ProjectVisibilityValue,
} from "./project-membership.constants";

type MemberWorkload = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  p0: number;
  p1: number;
  p2: number;
  p3: number;
};

type ProjectBaseRow = {
  id: string;
  name: string;
  projectKey: string;
  description: string | null;
  icon: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibilityValue;
  joinPolicy: JoinPolicyValue;
  ownerId: string;
  memberColorSeed: string | null;
  taskSeq: number;
  createdAt: Date;
  updatedAt: Date;
  owner: UserProfile;
  moduleCount: number;
  taskCount: number;
};

type ProjectMemberRow = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRoleValue;
  status: ProjectMemberStatusValue;
  joinedAt: Date | null;
  invitedBy: string | null;
  approvedBy: string | null;
  displayColorToken: string | null;
  createdAt: Date;
  user: UserProfile;
  inviter: UserProfile | null;
  approver: UserProfile | null;
};

type ProjectAccessRow = {
  id: string;
  ownerId: string;
  visibility: ProjectVisibilityValue;
  joinPolicy: JoinPolicyValue;
  memberId: string | null;
  role: ProjectRoleValue | null;
  status: ProjectMemberStatusValue | null;
};

const ACTIVE_TASK_STATUSES = new Set(["TODO", "IN_PROGRESS"]);

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async listProjects(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    const baseRows = await this.fetchProjectBaseRows(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM project_members pm
        WHERE pm.project_id = p.id
          AND pm.user_id = ${userId}
          AND pm.status = CAST('ACTIVE' AS "ProjectMemberStatus")
      )
    `);

    const memberRows = await this.fetchProjectMemberRows(baseRows.map((row) => BigInt(row.id)));
    return this.serializeProjectSummaries(baseRows, memberRows, userId.toString());
  }

  async listDiscoverableProjects(currentUserId: string) {
    const userId = parseBigIntId(currentUserId, "userId");
    const baseRows = await this.fetchProjectBaseRows(Prisma.sql`
      NOT EXISTS (
        SELECT 1
        FROM project_members pm
        WHERE pm.project_id = p.id
          AND pm.user_id = ${userId}
          AND pm.status = CAST('ACTIVE' AS "ProjectMemberStatus")
      )
      AND (
        p.visibility = CAST('ORG_VISIBLE' AS "ProjectVisibility")
        OR EXISTS (
          SELECT 1
          FROM project_members viewer_pm
          WHERE viewer_pm.project_id = p.id
            AND viewer_pm.user_id = ${userId}
            AND viewer_pm.status IN (
              CAST('INVITED' AS "ProjectMemberStatus"),
              CAST('PENDING' AS "ProjectMemberStatus")
            )
        )
      )
    `);

    const memberRows = await this.fetchProjectMemberRows(baseRows.map((row) => BigInt(row.id)));
    return this.serializeProjectSummaries(baseRows, memberRows, userId.toString());
  }

  async createProject(currentUserId: string, dto: CreateProjectDto) {
    const ownerId = parseBigIntId(currentUserId, "userId");

    const existingProject = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id::text AS id
      FROM projects
      WHERE project_key = ${dto.projectKey}
      LIMIT 1
    `);

    if (existingProject.length > 0) {
      throw new ConflictException("项目标识已存在");
    }

    const visibility = dto.visibility ?? "PRIVATE";
    const joinPolicy = dto.joinPolicy ?? "INVITE_ONLY";
    const status = dto.status ?? ProjectStatus.ACTIVE;

    const projectRow = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      INSERT INTO projects (
        name,
        project_key,
        description,
        icon,
        status,
        visibility,
        join_policy,
        owner_id,
        member_color_seed,
        updated_at
      )
      VALUES (
        ${dto.name},
        ${dto.projectKey},
        ${normalizeOptionalString(dto.description)},
        ${normalizeOptionalString(dto.icon)},
        CAST(${status} AS "ProjectStatus"),
        CAST(${visibility} AS "ProjectVisibility"),
        CAST(${joinPolicy} AS "JoinPolicy"),
        ${ownerId},
        ${dto.projectKey},
        NOW()
      )
      RETURNING id::text AS id
    `);

    if (!projectRow[0]) {
      throw new BadRequestException("项目创建失败");
    }

    const projectId = BigInt(projectRow[0].id);

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO project_members (
        project_id,
        user_id,
        role,
        status,
        joined_at,
        created_at
      )
      VALUES (
        ${projectId},
        ${ownerId},
        CAST('OWNER' AS "ProjectRole"),
        CAST('ACTIVE' AS "ProjectMemberStatus"),
        NOW(),
        NOW()
      )
      ON CONFLICT (project_id, user_id) DO UPDATE SET
        role = CAST('OWNER' AS "ProjectRole"),
        status = CAST('ACTIVE' AS "ProjectMemberStatus"),
        joined_at = COALESCE(project_members.joined_at, NOW())
    `);

    return this.fetchProjectDetail(projectId, ownerId.toString());
  }

  async getProjectById(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectMember(projectId, currentUserId);
    return this.fetchProjectDetail(projectId, currentUserId);
  }

  async updateProject(projectIdParam: string, currentUserId: string, dto: UpdateProjectDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectAdmin(projectId, currentUserId);

    if (dto.projectKey) {
      const existingProject = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT id::text AS id
        FROM projects
        WHERE project_key = ${dto.projectKey}
          AND id <> ${projectId}
        LIMIT 1
      `);

      if (existingProject.length > 0) {
        throw new ConflictException("项目标识已存在");
      }
    }

    const updates: Prisma.Sql[] = [];

    if (dto.name !== undefined) {
      updates.push(Prisma.sql`name = ${dto.name}`);
    }

    if (dto.projectKey !== undefined) {
      updates.push(Prisma.sql`project_key = ${dto.projectKey}`);
    }

    if (dto.description !== undefined) {
      updates.push(Prisma.sql`description = ${normalizeOptionalString(dto.description)}`);
    }

    if (dto.icon !== undefined) {
      updates.push(Prisma.sql`icon = ${normalizeOptionalString(dto.icon)}`);
    }

    if (dto.status !== undefined) {
      updates.push(Prisma.sql`status = CAST(${dto.status} AS "ProjectStatus")`);
    }

    if (dto.visibility !== undefined) {
      updates.push(Prisma.sql`visibility = CAST(${dto.visibility} AS "ProjectVisibility")`);
    }

    if (dto.joinPolicy !== undefined) {
      updates.push(Prisma.sql`join_policy = CAST(${dto.joinPolicy} AS "JoinPolicy")`);
    }

    if (updates.length > 0) {
      updates.push(Prisma.sql`updated_at = NOW()`);
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE projects
        SET ${Prisma.join(updates, ", ")}
        WHERE id = ${projectId}
      `);
    }

    return this.fetchProjectDetail(projectId, currentUserId);
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

    const [memberRows, workloadMap] = await Promise.all([
      this.fetchProjectMemberRows([projectId]),
      this.buildMemberWorkloadMap(projectId),
    ]);

    return memberRows.map((member) =>
      this.serializeProjectMember(member, workloadMap.get(member.userId) ?? this.emptyWorkload()),
    );
  }

  async addProjectMember(projectIdParam: string, currentUserId: string, dto: AddProjectMemberDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const operatorId = parseBigIntId(currentUserId, "userId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const targetUserId = parseBigIntId(dto.userId, "userId");
    const targetUser = await this.usersService.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException("目标用户不存在");
    }

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO project_members (
        project_id,
        user_id,
        role,
        status,
        joined_at,
        approved_by,
        created_at
      )
      VALUES (
        ${projectId},
        ${targetUserId},
        CAST(${dto.role} AS "ProjectRole"),
        CAST('ACTIVE' AS "ProjectMemberStatus"),
        NOW(),
        ${operatorId},
        NOW()
      )
      ON CONFLICT (project_id, user_id) DO UPDATE SET
        role = CAST(${dto.role} AS "ProjectRole"),
        status = CAST('ACTIVE' AS "ProjectMemberStatus"),
        joined_at = COALESCE(project_members.joined_at, NOW()),
        approved_by = ${operatorId}
    `);

    const member = await this.fetchProjectMemberByUserId(projectId, targetUserId);
    return this.serializeProjectMember(member, this.emptyWorkload());
  }

  async joinProject(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const userId = parseBigIntId(currentUserId, "userId");
    const access = await this.getProjectAccess(projectId, userId);

    if (access.isActiveMember) {
      throw new ConflictException("你已经是该项目成员");
    }

    if (access.status === "INVITED" && access.memberId) {
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE project_members
        SET
          status = CAST('ACTIVE' AS "ProjectMemberStatus"),
          joined_at = NOW(),
          approved_by = COALESCE(invited_by, approved_by)
        WHERE id = ${BigInt(access.memberId)}
      `);

      const member = await this.fetchProjectMemberById(projectId, BigInt(access.memberId));
      return {
        result: "joined",
        membership: this.serializeProjectMember(member, this.emptyWorkload()),
      };
    }

    if (access.visibility !== "ORG_VISIBLE") {
      throw new ForbiddenException("当前项目不支持直接申请或加入");
    }

    if (access.joinPolicy === "INVITE_ONLY") {
      throw new ForbiddenException("当前项目仅支持邀请加入");
    }

    if (access.joinPolicy === "OPEN") {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO project_members (
          project_id,
          user_id,
          role,
          status,
          joined_at,
          created_at
        )
        VALUES (
          ${projectId},
          ${userId},
          CAST('MEMBER' AS "ProjectRole"),
          CAST('ACTIVE' AS "ProjectMemberStatus"),
          NOW(),
          NOW()
        )
        ON CONFLICT (project_id, user_id) DO UPDATE SET
          role = CAST('MEMBER' AS "ProjectRole"),
          status = CAST('ACTIVE' AS "ProjectMemberStatus"),
          joined_at = COALESCE(project_members.joined_at, NOW())
      `);

      const member = await this.fetchProjectMemberByUserId(projectId, userId);
      return {
        result: "joined",
        membership: this.serializeProjectMember(member, this.emptyWorkload()),
      };
    }

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO project_members (
        project_id,
        user_id,
        role,
        status,
        created_at
      )
      VALUES (
        ${projectId},
        ${userId},
        CAST('MEMBER' AS "ProjectRole"),
        CAST('PENDING' AS "ProjectMemberStatus"),
        NOW()
      )
      ON CONFLICT (project_id, user_id) DO UPDATE SET
        role = CAST('MEMBER' AS "ProjectRole"),
        status = CAST('PENDING' AS "ProjectMemberStatus")
    `);

    const member = await this.fetchProjectMemberByUserId(projectId, userId);
    return {
      result: "pending",
      membership: this.serializeProjectMember(member, this.emptyWorkload()),
    };
  }

  async inviteProjectMember(projectIdParam: string, currentUserId: string, dto: InviteProjectMemberDto) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const operatorId = parseBigIntId(currentUserId, "userId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const targetUser = await this.usersService.findByEmail(dto.email);
    if (!targetUser) {
      throw new NotFoundException("目标用户不存在，请先完成注册");
    }

    const access = await this.getProjectAccess(projectId, targetUser.id);
    if (access.isActiveMember) {
      throw new ConflictException("该用户已经是项目成员");
    }

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO project_members (
        project_id,
        user_id,
        role,
        status,
        invited_by,
        display_color_token,
        created_at
      )
      VALUES (
        ${projectId},
        ${targetUser.id},
        CAST(${dto.role ?? "MEMBER"} AS "ProjectRole"),
        CAST('INVITED' AS "ProjectMemberStatus"),
        ${operatorId},
        ${normalizeOptionalString(dto.displayColorToken)},
        NOW()
      )
      ON CONFLICT (project_id, user_id) DO UPDATE SET
        role = CAST(${dto.role ?? "MEMBER"} AS "ProjectRole"),
        status = CAST('INVITED' AS "ProjectMemberStatus"),
        invited_by = ${operatorId},
        approved_by = NULL,
        joined_at = NULL,
        display_color_token = ${normalizeOptionalString(dto.displayColorToken)}
    `);

    const member = await this.fetchProjectMemberByUserId(projectId, targetUser.id);
    return this.serializeProjectMember(member, this.emptyWorkload());
  }

  async approveProjectMember(projectIdParam: string, memberIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const memberId = parseBigIntId(memberIdParam, "memberId");
    const approverId = parseBigIntId(currentUserId, "userId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const member = await this.fetchProjectMemberById(projectId, memberId);
    if (member.role === "OWNER") {
      throw new ForbiddenException("不能审批 OWNER");
    }

    if (member.status === "ACTIVE") {
      throw new ConflictException("该成员已处于激活状态");
    }

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE project_members
      SET
        status = CAST('ACTIVE' AS "ProjectMemberStatus"),
        joined_at = NOW(),
        approved_by = ${approverId}
      WHERE id = ${memberId}
    `);

    return this.serializeProjectMember(
      await this.fetchProjectMemberById(projectId, memberId),
      this.emptyWorkload(),
    );
  }

  async rejectProjectMember(projectIdParam: string, memberIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const memberId = parseBigIntId(memberIdParam, "memberId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const member = await this.fetchProjectMemberById(projectId, memberId);
    if (member.role === "OWNER") {
      throw new ForbiddenException("不能拒绝 OWNER");
    }

    if (member.status === "ACTIVE") {
      throw new BadRequestException("激活成员请使用移除接口");
    }

    await this.prisma.$executeRaw(Prisma.sql`
      DELETE FROM project_members
      WHERE id = ${memberId}
    `);

    return {
      message: "已拒绝加入申请",
    };
  }

  async removeProjectMember(projectIdParam: string, memberIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const memberId = parseBigIntId(memberIdParam, "memberId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const member = await this.fetchProjectMemberById(projectId, memberId);
    if (member.role === "OWNER") {
      throw new ForbiddenException("不能移除 OWNER");
    }

    await this.prisma.$executeRaw(Prisma.sql`
      DELETE FROM project_members
      WHERE id = ${memberId}
    `);

    return {
      message: "成员已移除",
    };
  }

  async updateProjectMemberRole(
    projectIdParam: string,
    memberIdParam: string,
    currentUserId: string,
    dto: UpdateProjectMemberRoleDto,
  ) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    const memberId = parseBigIntId(memberIdParam, "memberId");
    await this.assertProjectAdmin(projectId, currentUserId);

    const member = await this.fetchProjectMemberById(projectId, memberId);
    if (member.role === "OWNER") {
      throw new ForbiddenException("不能修改 OWNER 角色");
    }

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE project_members
      SET role = CAST(${dto.role} AS "ProjectRole")
      WHERE id = ${memberId}
    `);

    return this.serializeProjectMember(
      await this.fetchProjectMemberById(projectId, memberId),
      this.emptyWorkload(),
    );
  }

  async getProjectMemberWorkloads(projectIdParam: string, currentUserId: string) {
    const projectId = parseBigIntId(projectIdParam, "projectId");
    await this.assertProjectMember(projectId, currentUserId);

    const [members, workloadMap] = await Promise.all([
      this.fetchProjectMemberRows([projectId], Prisma.sql`pm.status = CAST('ACTIVE' AS "ProjectMemberStatus")`),
      this.buildMemberWorkloadMap(projectId),
    ]);

    return members.map((member) => ({
      ...this.serializeProjectMember(member, workloadMap.get(member.userId) ?? this.emptyWorkload()),
      stats: workloadMap.get(member.userId) ?? this.emptyWorkload(),
    }));
  }

  async assertProjectMember(projectId: bigint, currentUserId: string) {
    const access = await this.getProjectAccess(projectId, parseBigIntId(currentUserId, "userId"));
    if (!access.isActiveMember) {
      throw new ForbiddenException("非项目成员无权访问该项目");
    }

    return access;
  }

  async assertProjectAdmin(projectId: bigint, currentUserId: string) {
    const access = await this.getProjectAccess(projectId, parseBigIntId(currentUserId, "userId"));
    if (!access.isActiveMember || !this.isMemberManager(access.role)) {
      throw new ForbiddenException("当前用户无项目管理权限");
    }

    return access;
  }

  async assertProjectContributor(projectId: bigint, currentUserId: string) {
    const access = await this.getProjectAccess(projectId, parseBigIntId(currentUserId, "userId"));
    if (!access.isActiveMember || !this.canWriteTasks(access.role)) {
      throw new ForbiddenException("当前用户无任务编辑权限");
    }

    return access;
  }

  async assertProjectMemberByParam(projectIdParam: string, currentUserId: string) {
    return this.assertProjectMember(parseBigIntId(projectIdParam, "projectId"), currentUserId);
  }

  async assertProjectAdminByParam(projectIdParam: string, currentUserId: string) {
    return this.assertProjectAdmin(parseBigIntId(projectIdParam, "projectId"), currentUserId);
  }

  async assertUserIsProjectMember(projectId: bigint, userId: bigint) {
    const access = await this.getProjectAccess(projectId, userId);
    if (!access.isActiveMember) {
      throw new BadRequestException("目标用户不是项目有效成员");
    }
  }

  private async fetchProjectDetail(projectId: bigint, currentUserId: string) {
    const viewerUserId = parseBigIntId(currentUserId, "userId");
    const baseRows = await this.fetchProjectBaseRows(Prisma.sql`p.id = ${projectId}`, Prisma.sql``);
    if (baseRows.length === 0) {
      throw new NotFoundException("项目不存在");
    }

    const memberRows = await this.fetchProjectMemberRows([projectId]);
    const summary = this.serializeProjectSummaries(baseRows, memberRows, viewerUserId.toString())[0];

    return {
      ...summary,
      members: memberRows
        .filter((member) => member.status === "ACTIVE")
        .map((member) => this.serializeProjectMember(member)),
    };
  }

  private async fetchProjectBaseRows(whereClause: Prisma.Sql, orderBy = Prisma.sql`ORDER BY p.updated_at DESC`) {
    return this.prisma.$queryRaw<ProjectBaseRow[]>(Prisma.sql`
      SELECT
        p.id::text AS id,
        p.name,
        p.project_key AS "projectKey",
        p.description,
        p.icon,
        p.status::text AS status,
        p.visibility::text AS visibility,
        COALESCE(p.join_policy::text, 'INVITE_ONLY') AS "joinPolicy",
        p.owner_id::text AS "ownerId",
        p.member_color_seed AS "memberColorSeed",
        p.task_seq AS "taskSeq",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        json_build_object(
          'id', owner.id::text,
          'email', owner.email,
          'name', owner.name,
          'avatarUrl', owner.avatar_url,
          'status', owner.status::text,
          'createdAt', owner.created_at,
          'updatedAt', owner.updated_at
        ) AS owner,
        (
          SELECT COUNT(*)::int
          FROM modules m
          WHERE m.project_id = p.id
        ) AS "moduleCount",
        (
          SELECT COUNT(*)::int
          FROM tasks t
          WHERE t.project_id = p.id
            AND t.deleted_at IS NULL
        ) AS "taskCount"
      FROM projects p
      INNER JOIN users owner ON owner.id = p.owner_id
      WHERE ${whereClause}
      ${orderBy}
    `);
  }

  private async fetchProjectMemberRows(projectIds: bigint[], extraWhere?: Prisma.Sql) {
    if (projectIds.length === 0) {
      return [];
    }

    return this.prisma.$queryRaw<ProjectMemberRow[]>(Prisma.sql`
      SELECT
        pm.id::text AS id,
        pm.project_id::text AS "projectId",
        pm.user_id::text AS "userId",
        pm.role::text AS role,
        pm.status::text AS status,
        pm.joined_at AS "joinedAt",
        pm.invited_by::text AS "invitedBy",
        pm.approved_by::text AS "approvedBy",
        pm.display_color_token AS "displayColorToken",
        pm.created_at AS "createdAt",
        json_build_object(
          'id', member_user.id::text,
          'email', member_user.email,
          'name', member_user.name,
          'avatarUrl', member_user.avatar_url,
          'status', member_user.status::text,
          'createdAt', member_user.created_at,
          'updatedAt', member_user.updated_at
        ) AS user,
        CASE
          WHEN inviter.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', inviter.id::text,
            'email', inviter.email,
            'name', inviter.name,
            'avatarUrl', inviter.avatar_url,
            'status', inviter.status::text,
            'createdAt', inviter.created_at,
            'updatedAt', inviter.updated_at
          )
        END AS inviter,
        CASE
          WHEN approver.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', approver.id::text,
            'email', approver.email,
            'name', approver.name,
            'avatarUrl', approver.avatar_url,
            'status', approver.status::text,
            'createdAt', approver.created_at,
            'updatedAt', approver.updated_at
          )
        END AS approver
      FROM project_members pm
      INNER JOIN users member_user ON member_user.id = pm.user_id
      LEFT JOIN users inviter ON inviter.id = pm.invited_by
      LEFT JOIN users approver ON approver.id = pm.approved_by
      WHERE pm.project_id IN (${Prisma.join(projectIds)})
        ${extraWhere ? Prisma.sql`AND ${extraWhere}` : Prisma.empty}
      ORDER BY
        pm.project_id ASC,
        CASE pm.status::text
          WHEN 'ACTIVE' THEN 0
          WHEN 'INVITED' THEN 1
          ELSE 2
        END ASC,
        CASE pm.role::text
          WHEN 'OWNER' THEN 0
          WHEN 'ADMIN' THEN 1
          WHEN 'MEMBER' THEN 2
          ELSE 3
        END ASC,
        pm.created_at ASC,
        pm.id ASC
    `);
  }

  private async fetchProjectMemberById(projectId: bigint, memberId: bigint) {
    const members = await this.prisma.$queryRaw<ProjectMemberRow[]>(Prisma.sql`
      SELECT
        pm.id::text AS id,
        pm.project_id::text AS "projectId",
        pm.user_id::text AS "userId",
        pm.role::text AS role,
        pm.status::text AS status,
        pm.joined_at AS "joinedAt",
        pm.invited_by::text AS "invitedBy",
        pm.approved_by::text AS "approvedBy",
        pm.display_color_token AS "displayColorToken",
        pm.created_at AS "createdAt",
        json_build_object(
          'id', member_user.id::text,
          'email', member_user.email,
          'name', member_user.name,
          'avatarUrl', member_user.avatar_url,
          'status', member_user.status::text,
          'createdAt', member_user.created_at,
          'updatedAt', member_user.updated_at
        ) AS user,
        CASE
          WHEN inviter.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', inviter.id::text,
            'email', inviter.email,
            'name', inviter.name,
            'avatarUrl', inviter.avatar_url,
            'status', inviter.status::text,
            'createdAt', inviter.created_at,
            'updatedAt', inviter.updated_at
          )
        END AS inviter,
        CASE
          WHEN approver.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', approver.id::text,
            'email', approver.email,
            'name', approver.name,
            'avatarUrl', approver.avatar_url,
            'status', approver.status::text,
            'createdAt', approver.created_at,
            'updatedAt', approver.updated_at
          )
        END AS approver
      FROM project_members pm
      INNER JOIN users member_user ON member_user.id = pm.user_id
      LEFT JOIN users inviter ON inviter.id = pm.invited_by
      LEFT JOIN users approver ON approver.id = pm.approved_by
      WHERE pm.project_id = ${projectId}
        AND pm.id = ${memberId}
      LIMIT 1
    `);

    if (!members[0]) {
      throw new NotFoundException("成员记录不存在");
    }

    return members[0];
  }

  private async fetchProjectMemberByUserId(projectId: bigint, userId: bigint) {
    const members = await this.prisma.$queryRaw<ProjectMemberRow[]>(Prisma.sql`
      SELECT
        pm.id::text AS id,
        pm.project_id::text AS "projectId",
        pm.user_id::text AS "userId",
        pm.role::text AS role,
        pm.status::text AS status,
        pm.joined_at AS "joinedAt",
        pm.invited_by::text AS "invitedBy",
        pm.approved_by::text AS "approvedBy",
        pm.display_color_token AS "displayColorToken",
        pm.created_at AS "createdAt",
        json_build_object(
          'id', member_user.id::text,
          'email', member_user.email,
          'name', member_user.name,
          'avatarUrl', member_user.avatar_url,
          'status', member_user.status::text,
          'createdAt', member_user.created_at,
          'updatedAt', member_user.updated_at
        ) AS user,
        CASE
          WHEN inviter.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', inviter.id::text,
            'email', inviter.email,
            'name', inviter.name,
            'avatarUrl', inviter.avatar_url,
            'status', inviter.status::text,
            'createdAt', inviter.created_at,
            'updatedAt', inviter.updated_at
          )
        END AS inviter,
        CASE
          WHEN approver.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', approver.id::text,
            'email', approver.email,
            'name', approver.name,
            'avatarUrl', approver.avatar_url,
            'status', approver.status::text,
            'createdAt', approver.created_at,
            'updatedAt', approver.updated_at
          )
        END AS approver
      FROM project_members pm
      INNER JOIN users member_user ON member_user.id = pm.user_id
      LEFT JOIN users inviter ON inviter.id = pm.invited_by
      LEFT JOIN users approver ON approver.id = pm.approved_by
      WHERE pm.project_id = ${projectId}
        AND pm.user_id = ${userId}
      LIMIT 1
    `);

    if (!members[0]) {
      throw new NotFoundException("成员记录不存在");
    }

    return members[0];
  }

  private serializeProjectSummaries(
    baseRows: ProjectBaseRow[],
    memberRows: ProjectMemberRow[],
    viewerUserId: string,
  ) {
    const membersByProjectId = new Map<string, ProjectMemberRow[]>();

    for (const member of memberRows) {
      const list = membersByProjectId.get(member.projectId) ?? [];
      list.push(member);
      membersByProjectId.set(member.projectId, list);
    }

    return baseRows.map((row) => {
      const members = membersByProjectId.get(row.id) ?? [];
      const activeMembers = members.filter((member) => member.status === "ACTIVE");
      const viewerMembership =
        members.find((member) => member.userId === viewerUserId) ??
        (row.ownerId === viewerUserId
          ? {
              id: `owner-${row.id}`,
              projectId: row.id,
              userId: viewerUserId,
              role: "OWNER" as const,
              status: "ACTIVE" as const,
              joinedAt: row.createdAt,
              invitedBy: null,
              approvedBy: null,
              displayColorToken: null,
              createdAt: row.createdAt,
              user: row.owner,
              inviter: null,
              approver: null,
            }
          : null);

      return {
        id: row.id,
        name: row.name,
        projectKey: row.projectKey,
        description: row.description,
        icon: row.icon,
        status: row.status,
        visibility: row.visibility,
        joinPolicy: row.joinPolicy,
        memberColorSeed: row.memberColorSeed,
        taskSeq: row.taskSeq,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        owner: row.owner,
        members: activeMembers.map((member) => ({
          id: member.id,
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          displayColorToken: member.displayColorToken,
        })),
        memberCount: activeMembers.length,
        pendingMemberCount: members.filter((member) => member.status === "PENDING").length,
        invitedMemberCount: members.filter((member) => member.status === "INVITED").length,
        viewerMembership: viewerMembership
          ? {
              id: viewerMembership.id,
              userId: viewerMembership.userId,
              role: viewerMembership.role,
              status: viewerMembership.status,
              joinedAt: viewerMembership.joinedAt,
              displayColorToken: viewerMembership.displayColorToken,
            }
          : null,
        joinAction: this.resolveJoinAction(row.visibility, row.joinPolicy, viewerMembership?.status ?? null),
        _count: {
          modules: row.moduleCount,
          tasks: row.taskCount,
        },
      };
    });
  }

  private resolveJoinAction(
    visibility: ProjectVisibilityValue,
    joinPolicy: JoinPolicyValue,
    viewerStatus: ProjectMemberStatusValue | null,
  ) {
    if (viewerStatus === "ACTIVE") {
      return null;
    }

    if (viewerStatus === "INVITED") {
      return "INVITED";
    }

    if (viewerStatus === "PENDING") {
      return "PENDING";
    }

    if (visibility !== "ORG_VISIBLE") {
      return null;
    }

    if (joinPolicy === "OPEN") {
      return "JOIN";
    }

    if (joinPolicy === "REQUEST_APPROVAL") {
      return "REQUEST";
    }

    return null;
  }

  private serializeProjectMember(member: ProjectMemberRow, stats = this.emptyWorkload()) {
    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      invitedBy: member.invitedBy,
      approvedBy: member.approvedBy,
      displayColorToken: member.displayColorToken,
      createdAt: member.createdAt,
      user: member.user,
      inviter: member.inviter,
      approver: member.approver,
      stats,
    };
  }

  private emptyWorkload(): MemberWorkload {
    return {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
      p0: 0,
      p1: 0,
      p2: 0,
      p3: 0,
    };
  }

  private async buildMemberWorkloadMap(projectId: bigint) {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      select: {
        assigneeId: true,
        status: true,
        priority: true,
        dueAt: true,
      },
    });

    const now = Date.now();
    const workloadMap = new Map<string, MemberWorkload>();

    for (const task of tasks) {
      if (!task.assigneeId) {
        continue;
      }

      const key = task.assigneeId.toString();
      const current = workloadMap.get(key) ?? this.emptyWorkload();

      current.total += 1;

      if (task.status === "TODO") {
        current.todo += 1;
      }

      if (task.status === "IN_PROGRESS") {
        current.inProgress += 1;
      }

      if (task.status === "DONE" || task.status === "CLOSED") {
        current.done += 1;
      }

      if (task.priority === "P0") {
        current.p0 += 1;
      } else if (task.priority === "P1") {
        current.p1 += 1;
      } else if (task.priority === "P2") {
        current.p2 += 1;
      } else if (task.priority === "P3") {
        current.p3 += 1;
      }

      if (
        task.dueAt &&
        task.dueAt.getTime() < now &&
        ACTIVE_TASK_STATUSES.has(task.status)
      ) {
        current.overdue += 1;
      }

      workloadMap.set(key, current);
    }

    return workloadMap;
  }

  private async getProjectAccess(projectId: bigint, userId: bigint) {
    const rows = await this.prisma.$queryRaw<ProjectAccessRow[]>(Prisma.sql`
      SELECT
        p.id::text AS id,
        p.owner_id::text AS "ownerId",
        p.visibility::text AS visibility,
        COALESCE(p.join_policy::text, 'INVITE_ONLY') AS "joinPolicy",
        pm.id::text AS "memberId",
        pm.role::text AS role,
        pm.status::text AS status
      FROM projects p
      LEFT JOIN project_members pm
        ON pm.project_id = p.id
       AND pm.user_id = ${userId}
      WHERE p.id = ${projectId}
      LIMIT 1
    `);

    if (!rows[0]) {
      throw new NotFoundException("项目不存在");
    }

    const row = rows[0];
    const isOwner = row.ownerId === userId.toString();
    const role = isOwner ? "OWNER" : row.role;

    return {
      ...row,
      role,
      isActiveMember: isOwner || row.status === "ACTIVE",
    };
  }

  private isMemberManager(role: ProjectRoleValue | null) {
    return role === "OWNER" || role === "ADMIN";
  }

  private canWriteTasks(role: ProjectRoleValue | null) {
    return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
  }
}
