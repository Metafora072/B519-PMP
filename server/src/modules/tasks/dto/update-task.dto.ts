import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString, Matches } from "class-validator";
import { Transform } from "class-transformer";

import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsString()
  @Matches(/^\d*$/)
  @Transform(({ value }) => value?.trim())
  moduleId?: string;
}
