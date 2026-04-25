import { IsIn } from "class-validator";

import {
  MANAGEABLE_PROJECT_ROLE_VALUES,
  type ManageableProjectRoleValue,
} from "../project-membership.constants";

export class UpdateProjectMemberRoleDto {
  @IsIn(MANAGEABLE_PROJECT_ROLE_VALUES)
  role!: ManageableProjectRoleValue;
}
