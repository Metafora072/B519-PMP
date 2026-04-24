export type UserStatus = "ACTIVE" | "INACTIVE";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type ProjectVisibility = "PRIVATE" | "INTERNAL" | "PUBLIC";
export type ProjectRole = "PROJECT_ADMIN" | "MODULE_OWNER" | "MEMBER" | "GUEST";
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

export type ProjectSummary = {
  id: string;
  name: string;
  projectKey: string;
  description: string | null;
  icon: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  taskSeq: number;
  createdAt: string;
  updatedAt: string;
  owner: UserProfile;
  members: Array<{
    id: string;
    role: ProjectRole;
    userId: string;
  }>;
  _count: {
    modules: number;
    tasks: number;
  };
};

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  createdAt: string;
  user: UserProfile;
};

export type ProjectDetail = Omit<ProjectSummary, "members"> & {
  members: ProjectMember[];
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
};

export type TaskListFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  moduleId?: string;
  assigneeId?: string;
  keyword?: string;
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
