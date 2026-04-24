import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserPayload } from "../../common/types/current-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ActivityLogsService } from "./activity-logs.service";
import { ListActivitiesQueryDto } from "./dto/list-activities-query.dto";

@UseGuards(JwtAuthGuard)
@Controller()
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get("tasks/:id/activities")
  listTaskActivities(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListActivitiesQueryDto,
  ) {
    return this.activityLogsService.listTaskActivities(id, currentUser.id, query);
  }

  @Get("projects/:id/activities")
  listProjectActivities(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListActivitiesQueryDto,
  ) {
    return this.activityLogsService.listProjectActivities(id, currentUser.id, query);
  }
}
