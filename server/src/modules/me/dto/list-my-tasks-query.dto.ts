import { IsIn } from "class-validator";

const WORKBENCH_SCOPES = [
  "assigned",
  "created",
  "watching",
  "overdue",
  "dueToday",
  "highPriority",
] as const;

export class ListMyTasksQueryDto {
  @IsIn(WORKBENCH_SCOPES)
  scope!: (typeof WORKBENCH_SCOPES)[number];
}
