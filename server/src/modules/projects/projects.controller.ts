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

  @Post()
  createProject(@CurrentUser() currentUser: CurrentUserPayload, @Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(currentUser.id, dto);
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

  @Post(":id/members")
  addMember(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(id, currentUser.id, dto);
  }
}

