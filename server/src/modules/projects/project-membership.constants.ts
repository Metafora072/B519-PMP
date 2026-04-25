export const PROJECT_VISIBILITY_VALUES = [
  "PRIVATE",
  "MEMBERS_VISIBLE",
  "ORG_VISIBLE",
] as const;

export const JOIN_POLICY_VALUES = [
  "INVITE_ONLY",
  "REQUEST_APPROVAL",
  "OPEN",
] as const;

export const PROJECT_ROLE_VALUES = [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "GUEST",
] as const;

export const MANAGEABLE_PROJECT_ROLE_VALUES = [
  "ADMIN",
  "MEMBER",
  "GUEST",
] as const;

export const PROJECT_MEMBER_STATUS_VALUES = [
  "ACTIVE",
  "INVITED",
  "PENDING",
] as const;

export type ProjectVisibilityValue = (typeof PROJECT_VISIBILITY_VALUES)[number];
export type JoinPolicyValue = (typeof JOIN_POLICY_VALUES)[number];
export type ProjectRoleValue = (typeof PROJECT_ROLE_VALUES)[number];
export type ManageableProjectRoleValue = (typeof MANAGEABLE_PROJECT_ROLE_VALUES)[number];
export type ProjectMemberStatusValue = (typeof PROJECT_MEMBER_STATUS_VALUES)[number];
