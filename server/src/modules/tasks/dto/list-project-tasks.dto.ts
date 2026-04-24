import { TaskPriority, TaskStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class ListProjectTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\d+|none)$/)
  @Transform(({ value }) => value?.trim())
  moduleId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value?.trim())
  assigneeId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
