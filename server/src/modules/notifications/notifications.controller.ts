import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserPayload } from "../../common/types/current-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto";
import { NotificationsService } from "./notifications.service";

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  listNotifications(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsService.listNotifications(currentUser.id, query);
  }

  @Get("unread-count")
  getUnreadCount(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.getUnreadCount(currentUser.id);
  }

  @Post("read-all")
  markAllRead(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.markAllRead(currentUser.id);
  }

  @Post(":id/read")
  markRead(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.markNotificationRead(id, currentUser.id);
  }
}
