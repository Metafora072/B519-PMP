import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import configuration from "./config/env.configuration";
import { validationSchema } from "./config/validation.schema";
import { ActivityLogsModule } from "./modules/activity-logs/activity-logs.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { MeModule } from "./modules/me/me.module";
import { ModulesDomainModule } from "./modules/modules/modules.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    ModulesDomainModule,
    TasksModule,
    CommentsModule,
    ActivityLogsModule,
    MeModule,
    NotificationsModule,
  ],
})
export class AppModule {}
