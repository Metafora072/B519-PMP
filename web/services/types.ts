export type UserStatus = "ACTIVE" | "INACTIVE";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type ProjectVisibility = "PRIVATE" | "MEMBERS_VISIBLE" | "ORG_VISIBLE";
export type JoinPolicy = "INVITE_ONLY" | "REQUEST_APPROVAL" | "OPEN";
export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
export type ProjectMemberStatus = "ACTIVE" | "INVITED" | "PENDING";
export type ProjectJoinAction = "JOIN" | "REQUEST" | "INVITED" | "PENDING" | null;
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CLOSED";
export type TaskPriority = "P0" | "P1" | "P2" | "P3";
export type TaskType = "REQUIREMENT" | "BUG" | "IMPROVEMENT" | "TECH_DEBT" | "RESEARCH";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMemberStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  p0: number;
  p1: number;
  p2: number;
  p3: number;
};

export type ProjectViewerMembership = {
  id: string;
  userId: string;
  role: ProjectRole;
  status: ProjectMemberStatus;
  joinedAt: string | null;
  displayColorToken: string | null;
};

export type ProjectSummary = {
  id: string;
  name: string;
  projectKey: string;
  description: string | null;
  icon: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  joinPolicy: JoinPolicy;
  memberColorSeed: string | null;
  taskSeq: number;
  createdAt: string;
  updatedAt: string;
  owner: UserProfile;
  members: Array<{
    id: string;
    role: ProjectRole;
    userId: string;
    status: ProjectMemberStatus;
    joinedAt: string | null;
    displayColorToken: string | null;
  }>;
  memberCount: number;
  pendingMemberCount: number;
  invitedMemberCount: number;
  viewerMembership: ProjectViewerMembership | null;
  joinAction: ProjectJoinAction;
  _count: {
    modules: number;
    tasks: number;
  };
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  status: ProjectMemberStatus;
  joinedAt: string | null;
  invitedBy: string | null;
  approvedBy: string | null;
  displayColorToken: string | null;
  createdAt: string;
  user: UserProfile;
  inviter: UserProfile | null;
  approver: UserProfile | null;
  stats: ProjectMemberStats;
};

export type ProjectDetail = Omit<ProjectSummary, "members"> & {
  members: ProjectMember[];
};

export type ProjectMemberWorkload = ProjectMember & {
  stats: ProjectMemberStats;
};

export type ProjectModule = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  owner: UserProfile;
  project: {
    id: string;
    name: string;
    projectKey: string;
  };
  _count: {
    tasks: number;
  };
};

export type TaskRecord = {
  id: string;
  projectId: string;
  moduleId: string | null;
  taskNo: string;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  creatorId: string;
  assigneeId: string | null;
  dueAt: string | null;
  startAt: string | null;
  completedAt: string | null;
  repoName: string | null;
  branchName: string | null;
  prUrl: string | null;
  issueUrl: string | null;
  estimateHours: number | null;
  createdAt: string;
  updatedAt: string;
  creator: UserProfile;
  assignee: UserProfile | null;
  module: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    projectKey: string;
  };
};

export type PaginatedTasks = {
  items: TaskRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  grouping?: {
    groupBy: TaskGroupBy;
    viewMode: TaskViewMode;
    includeUnassigned: boolean;
    verticalGroupBy?: "status" | "assignee";
    horizontalGroupBy?: "status" | "assignee";
  };
  groups?: Array<{
    key: string;
    label: string;
    count: number;
  }>;
};

export type TaskGroupBy = "assignee" | "module" | "status" | "priority";
export type TaskViewMode = "list" | "board";

export type TaskListFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  moduleId?: string;
  assigneeId?: string;
  keyword?: string;
  groupBy?: TaskGroupBy;
  viewMode?: TaskViewMode;
  includeUnassigned?: boolean;
  verticalGroupBy?: "status" | "assignee";
  horizontalGroupBy?: "status" | "assignee";
  page?: number;
  pageSize?: number;
};

export type TaskBoardFilters = {
  priority?: TaskPriority;
  moduleId?: string;
  assigneeId?: string;
  keyword?: string;
};

export type CreateProjectInput = {
  name: string;
  projectKey: string;
  description?: string;
  visibility?: ProjectVisibility;
  joinPolicy?: JoinPolicy;
};

export type CreateModuleInput = {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
};

export type CreateTaskInput = {
  moduleId?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueAt?: string | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  moduleId?: string | null;
  dueAt?: string | null;
};

export type ProjectTaskSummary = {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

export type InviteProjectMemberInput = {
  email: string;
  role?: Exclude<ProjectRole, "OWNER">;
  displayColorToken?: string;
};

export type UpdateProjectMemberRoleInput = {
  role: Exclude<ProjectRole, "OWNER">;
};

export type TaskCommentRecord = {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: UserProfile;
};

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};

export type TaskActivityRecord = {
  id: string;
  projectId: string;
  taskId: string;
  operatorId: string;
  actionType: string;
  actionDetail: Record<string, unknown> | null;
  createdAt: string;
  operator: UserProfile;
  task: {
    id: string;
    taskNo: string;
    title: string;
  };
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedActivities = {
  items: TaskActivityRecord[];
  pagination: PaginationMeta;
};

export type ActivityListFilters = {
  page?: number;
  pageSize?: number;
};
