import { ProjectStatus, ProjectVisibility } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

import { normalizeProjectKey } from "../../../common/utils/normalize-string";

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => value.trim())
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[A-Z0-9_]+$/)
  @Transform(({ value }) => normalizeProjectKey(value))
  projectKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  icon?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectVisibility)
  visibility?: ProjectVisibility;
}

