import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserPayload } from "../../common/types/current-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateTaskDto } from "./dto/create-task.dto";
import { ListProjectTasksDto } from "./dto/list-project-tasks.dto";
import { UpdateTaskAssigneeDto } from "./dto/update-task-assignee.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskPriorityDto } from "./dto/update-task-priority.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { TasksService } from "./tasks.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get("projects/:id/tasks")
  listProjectTasks(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListProjectTasksDto,
  ) {
    return this.tasksService.listProjectTasks(id, currentUser.id, query);
  }

  @Post("projects/:id/tasks")
  createTask(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(id, currentUser.id, dto);
  }

  @Get("tasks/:id")
  getTask(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.tasksService.getTaskById(id, currentUser.id);
  }

  @Patch("tasks/:id")
  updateTask(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, currentUser.id, dto);
  }

  @Delete("tasks/:id")
  deleteTask(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.tasksService.deleteTask(id, currentUser.id);
  }

  @Patch("tasks/:id/status")
  updateStatus(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(id, currentUser.id, dto);
  }

  @Patch("tasks/:id/priority")
  updatePriority(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateTaskPriorityDto,
  ) {
    return this.tasksService.updateTaskPriority(id, currentUser.id, dto);
  }

  @Patch("tasks/:id/assignee")
  updateAssignee(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateTaskAssigneeDto,
  ) {
    return this.tasksService.updateTaskAssignee(id, currentUser.id, dto);
  }
}

