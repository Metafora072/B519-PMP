import { Module } from "@nestjs/common";

import { ProjectsModule } from "../projects/projects.module";
import { ActivityLogsController } from "./activity-logs.controller";
import { ActivityLogsService } from "./activity-logs.service";

@Module({
  imports: [ProjectsModule],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
})
export class ActivityLogsModule {}
