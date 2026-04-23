import { ProjectRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsString, Matches } from "class-validator";

export class AddProjectMemberDto {
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value.trim())
  userId!: string;

  @IsEnum(ProjectRole)
  role!: ProjectRole;
}

