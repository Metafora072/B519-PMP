import { Transform, Type } from "class-transformer";
import { TaskPriority, TaskStatus } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";

const TASK_GROUP_FIELDS = ["assignee", "module", "status", "priority"] as const;
const TASK_VIEW_MODES = ["list", "board"] as const;
const BOARD_GROUP_FIELDS = ["status", "assignee"] as const;

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
  @Matches(/^(?:\d+|none)$/)
  @Transform(({ value }) => value?.trim())
  assigneeId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @IsOptional()
  @IsIn(TASK_GROUP_FIELDS)
  groupBy?: (typeof TASK_GROUP_FIELDS)[number];

  @IsOptional()
  @IsIn(TASK_VIEW_MODES)
  viewMode?: (typeof TASK_VIEW_MODES)[number];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    return value === "true" || value === "1";
  })
  @IsBoolean()
  includeUnassigned?: boolean;

  @IsOptional()
  @IsIn(BOARD_GROUP_FIELDS)
  verticalGroupBy?: (typeof BOARD_GROUP_FIELDS)[number];

  @IsOptional()
  @IsIn(BOARD_GROUP_FIELDS)
  horizontalGroupBy?: (typeof BOARD_GROUP_FIELDS)[number];

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
