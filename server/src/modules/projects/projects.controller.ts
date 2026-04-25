import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserPayload } from "../../common/types/current-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { InviteProjectMemberDto } from "./dto/invite-project-member.dto";
import { UpdateProjectMemberRoleDto } from "./dto/update-project-member-role.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  listProjects(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.listProjects(currentUser.id);
  }

  @Get("discoverable")
  listDiscoverableProjects(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.listDiscoverableProjects(currentUser.id);
  }

  @Post()
  createProject(@CurrentUser() currentUser: CurrentUserPayload, @Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(currentUser.id, dto);
  }

  @Post(":id/join")
  joinProject(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.joinProject(id, currentUser.id);
  }

  @Get(":id")
  getProject(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.getProjectById(id, currentUser.id);
  }

  @Patch(":id")
  updateProject(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, currentUser.id, dto);
  }

  @Delete(":id")
  deleteProject(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.deleteProject(id, currentUser.id);
  }

  @Get(":id/members")
  listMembers(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.listProjectMembers(id, currentUser.id);
  }

  @Get(":id/member-workloads")
  listMemberWorkloads(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.projectsService.getProjectMemberWorkloads(id, currentUser.id);
  }

  @Post(":id/members")
  addMember(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(id, currentUser.id, dto);
  }

  @Post(":id/invitations")
  inviteMember(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: InviteProjectMemberDto,
  ) {
    return this.projectsService.inviteProjectMember(id, currentUser.id, dto);
  }

  @Post(":id/members/:memberId/approve")
  approveMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.projectsService.approveProjectMember(id, memberId, currentUser.id);
  }

  @Post(":id/members/:memberId/reject")
  rejectMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.projectsService.rejectProjectMember(id, memberId, currentUser.id);
  }

  @Patch(":id/members/:memberId/role")
  updateMemberRole(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.projectsService.updateProjectMemberRole(id, memberId, currentUser.id, dto);
  }

  @Delete(":id/members/:memberId")
  removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.projectsService.removeProjectMember(id, memberId, currentUser.id);
  }
}
