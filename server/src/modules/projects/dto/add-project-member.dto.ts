import { Transform } from "class-transformer";
import { IsIn, IsString, Matches } from "class-validator";

import {
  MANAGEABLE_PROJECT_ROLE_VALUES,
  type ManageableProjectRoleValue,
} from "../project-membership.constants";

export class AddProjectMemberDto {
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value.trim())
  userId!: string;

  @IsIn(MANAGEABLE_PROJECT_ROLE_VALUES)
  role!: ManageableProjectRoleValue;
}
