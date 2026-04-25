import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import {
  MANAGEABLE_PROJECT_ROLE_VALUES,
  type ManageableProjectRoleValue,
} from "../project-membership.constants";

export class InviteProjectMemberDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @IsOptional()
  @IsIn(MANAGEABLE_PROJECT_ROLE_VALUES)
  role?: ManageableProjectRoleValue;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  displayColorToken?: string;
}
