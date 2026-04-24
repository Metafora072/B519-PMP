import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateTaskDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value?.trim())
  moduleId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value?.trim())
  assigneeId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value?.trim())
  parentTaskId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  repoName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  branchName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  prUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  issueUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  estimateHours?: number;
}
