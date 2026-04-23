import { Module } from "@nestjs/common";

import { ModulesDomainModule } from "../modules/modules.module";
import { ProjectsModule } from "../projects/projects.module";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [ProjectsModule, ModulesDomainModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

