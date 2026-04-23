import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches, ValidateIf } from "class-validator";

export class UpdateTaskAssigneeDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === "") {
      return null;
    }

    return typeof value === "string" ? value.trim() : value;
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @Matches(/^\d+$/)
  assigneeId?: string | null;
}
