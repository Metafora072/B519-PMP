import { Module } from "@nestjs/common";

import { ProjectsModule } from "../projects/projects.module";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";

@Module({
  imports: [ProjectsModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesDomainModule {}

