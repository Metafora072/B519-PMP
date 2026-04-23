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
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
import { ModulesService } from "./modules.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get("projects/:id/modules")
  listProjectModules(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.modulesService.listProjectModules(id, currentUser.id);
  }

  @Post("projects/:id/modules")
  createProjectModule(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateModuleDto,
  ) {
    return this.modulesService.createProjectModule(id, currentUser.id, dto);
  }

  @Get("modules/:id")
  getModule(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.modulesService.getModuleById(id, currentUser.id);
  }

  @Patch("modules/:id")
  updateModule(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.modulesService.updateModule(id, currentUser.id, dto);
  }

  @Delete("modules/:id")
  deleteModule(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.modulesService.deleteModule(id, currentUser.id);
  }
}

