import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserPayload } from "../../common/types/current-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ListMyTasksQueryDto } from "./dto/list-my-tasks-query.dto";
import { MeService } from "./me.service";

@UseGuards(JwtAuthGuard)
@Controller("me")
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get("workbench/summary")
  getWorkbenchSummary(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.meService.getWorkbenchSummary(currentUser.id);
  }

  @Get("tasks")
  listMyTasks(@CurrentUser() currentUser: CurrentUserPayload, @Query() query: ListMyTasksQueryDto) {
    return this.meService.listMyTasks(currentUser.id, query);
  }

  @Get("pending-actions")
  getPendingActions(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.meService.getPendingActions(currentUser.id);
  }
}
