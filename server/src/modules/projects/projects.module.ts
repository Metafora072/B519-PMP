import { Module } from "@nestjs/common";

import { NotificationsModule } from "../notifications/notifications.module";
import { UsersModule } from "../users/users.module";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
