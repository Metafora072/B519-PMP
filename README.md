# Code Project Platform

基于设计文档 `Code-project-platform-design-spec.md` 的分阶段实现，当前完成：

- 前后端分离的 monorepo 基础工程初始化
- NestJS + Prisma + PostgreSQL + Redis 后端基础结构
- `users`、`projects`、`project_members`、`modules`、`tasks`、`task_comments`、`task_activity_logs`、`labels`、`task_labels` Prisma schema
- 认证模块：`register`、`login`、`me`、`logout`
- Next.js + TypeScript + Tailwind CSS + shadcn/ui 风格基础页面
- 登录页、首页骨架、左侧导航栏、顶部栏
- `docker-compose.yml` 中的 PostgreSQL 与 Redis

## 第 2 阶段已完成

- 新增 `projects`、`modules`、`tasks` 三个后端业务模块，均按 `controller / service / dto / module` 分层
- 所有业务接口接入当前登录用户鉴权，统一通过 JWT Cookie 访问
- 增加项目成员权限兜底：非项目成员不能读取或修改项目、模块、任务数据
- 新增项目成员管理接口：查询成员、添加成员
- 新增任务列表筛选与分页：`status`、`priority`、`moduleId`、`assigneeId`、`keyword`、`page`、`pageSize`
- 实现安全的任务编号生成方案：在 `projects.task_seq` 上做原子自增，生成 `PROJECTKEY-序号`
- 所有任务写操作补齐 activity log：创建、标题变更、描述变更、状态变更、优先级变更、负责人变更、删除

## 第 3 阶段已完成

- 前端补齐 TanStack Query 与 Zustand，建立统一 API Client、查询缓存、任务抽屉状态管理
- 新增 `features/project`、`features/module`、`features/task`、`hooks`、`store`、`services` 目录，按业务域拆分前端结构
- 完成 `/projects` 项目列表页，支持卡片布局与创建项目弹窗
- 完成 `/projects/:id` 项目详情页，接入项目、成员、模块与任务统计
- 完成 `/projects/:id/tasks` 任务列表页，支持状态、优先级、模块、负责人、关键字筛选与分页
- 完成右侧任务详情抽屉，支持标题、描述、模块、截止时间编辑，以及状态 / 优先级 / 负责人独立 patch
- 所有任务详情更新后自动刷新任务列表、任务详情与项目统计缓存

## 第 4 阶段已完成

- 新增 `/projects/:id/board` 项目看板页，作为项目主视图之一接入真实任务数据
- 引入 dnd-kit 完成按状态分列的任务看板，支持 Todo / In Progress / Done 三列拖拽流转
- 看板页接入轻量搜索与筛选，支持按关键字、优先级、模块、负责人过滤任务
- 看板卡片复用现有任务详情抽屉，点击卡片即可打开右侧详情并继续编辑
- 新增任务创建弹窗，支持在看板工具栏和列头快速创建任务
- 任务创建与编辑已放宽为“模块可选”，未分类任务可直接创建、展示与筛选
- 拖拽改状态采用前端乐观更新，请求失败时自动回滚并通过 toast 提示错误
- 拖拽与编辑成功后同步刷新任务列表缓存、看板缓存、任务详情缓存与项目统计缓存

## 第 5 阶段第 1 步已完成

- 新增 `comments` 后端模块，补齐任务评论查询、创建、编辑、删除接口
- 新增 `activity-logs` 后端模块，补齐任务维度与项目维度活动日志查询接口
- 所有评论与活动日志接口统一接入 JWT 鉴权和项目成员权限校验
- 评论默认按 `createdAt` 升序返回，评论作者本人或项目管理员才可编辑/删除
- 评论写操作会继续写入 `task_activity_logs`，与现有任务变更日志结构兼容
- 活动日志查询支持 `page`、`pageSize` 分页参数

## 第 5 阶段第 2 步已完成

- 任务详情抽屉接入评论区与活动日志时间线
- 评论区支持列表展示、发送、编辑自己的评论、删除自己的评论
- 评论发送成功后自动刷新评论列表与活动日志
- 活动日志已接入轻量 timeline，对常见 `action_type` 做可读化展示

## 第 5 阶段第 3 步已完成

- 项目详情页最近动态占位区已替换为真实 project activity feed
- 接入 `GET /api/projects/:id/activities`，默认展示最近 12 条动态
- 动态项展示操作人、动作、关联任务与时间，并保留“查看更多”入口占位
- 复用任务活动日志的 action 文案格式化逻辑，保持任务抽屉与项目概览页一致

## 第 6 阶段已完成

- 第 6-1 步：后端完成项目可见性、加入策略、成员状态、角色体系重构
- 第 6-1 步：新增 discoverable / join / invite / approve / reject / role / workload 接口，并重做项目成员权限边界
- 第 6-1 步：任务查询接口新增 `groupBy`、`viewMode`、`includeUnassigned`、`verticalGroupBy`、`horizontalGroupBy`
- 第 6-2 步：项目列表页拆分为“我参与的项目”和“可加入 / 可发现的项目”
- 第 6-2 步：新增项目成员页，支持邀请成员、审批加入、修改角色、移除成员
- 第 6-2 步：补齐成员视觉系统，统一 `MemberAvatar`、`MemberChip`、`MemberGroup`、`AssigneeBadge`
- 第 6-3 步：任务列表页默认按负责人分组，支持切换按负责人 / 模块 / 状态 / 平铺表格
- 第 6-3 步：看板页升级为“状态列 + 负责人泳道”基础结构，未分配泳道固定在首行
- 第 6-3 步：任务详情抽屉强化负责人位置，支持“快速分配给我”
- 第 6-3 步：项目详情页新增负责人负载卡片，突出谁负责什么

## 第 3 阶段新增路由

- `/projects`
- `/projects/:id`
- `/projects/:id/tasks`

## 第 4 阶段新增路由

- `/projects/:id/board`

## 第 6 阶段新增路由

- `/projects/:id/members`

## 第 5 阶段第 1 步新增接口

- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `PATCH /api/comments/:id`
- `DELETE /api/comments/:id`
- `GET /api/tasks/:id/activities`
- `GET /api/projects/:id/activities`

## 第 6 阶段新增接口

- `GET /api/projects/discoverable`
- `POST /api/projects/:id/join`
- `POST /api/projects/:id/invitations`
- `POST /api/projects/:id/members/:memberId/approve`
- `POST /api/projects/:id/members/:memberId/reject`
- `DELETE /api/projects/:id/members/:memberId`
- `PATCH /api/projects/:id/members/:memberId/role`
- `GET /api/projects/:id/member-workloads`
- `GET /api/projects/:id/tasks?groupBy=assignee|module|status|priority`
- `GET /api/projects/:id/tasks?viewMode=list|board`
- `GET /api/projects/:id/tasks?includeUnassigned=true|false`
- `GET /api/projects/:id/tasks?verticalGroupBy=status&horizontalGroupBy=assignee`

## 第 5 阶段第 2 步新增组件

- `web/features/task/task-comments-section.tsx`
- `web/features/task/task-comment-item.tsx`
- `web/features/task/task-comment-editor.tsx`
- `web/features/task/task-activity-timeline.tsx`
- `web/features/task/task-activity-item.tsx`

## 第 5 阶段第 2 步使用接口

- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `PATCH /api/comments/:id`
- `DELETE /api/comments/:id`
- `GET /api/tasks/:id/activities`

## 第 5 阶段第 3 步复用组件/工具

- `web/features/task/activity-presenter.ts`
- `web/features/project/queries.ts` 中的 `useProjectActivitiesQuery`
- `web/services/activities.ts` 中的 `getProjectActivities`

## 第 3 阶段核心组件

- `web/features/project/project-list-page.tsx`
- `web/features/project/project-detail-page.tsx`
- `web/features/project/project-create-dialog.tsx`
- `web/features/module/module-summary-list.tsx`
- `web/features/task/task-list-page.tsx`
- `web/features/task/task-filters-bar.tsx`
- `web/features/task/task-table.tsx`
- `web/features/task/task-detail-drawer.tsx`
- `web/components/providers/app-providers.tsx`

## 第 4 阶段核心组件

- `web/features/project/project-view-tabs.tsx`
- `web/features/task/task-board-page.tsx`
- `web/features/task/task-board.tsx`
- `web/features/task/task-board-column.tsx`
- `web/features/task/task-board-card.tsx`
- `web/features/task/task-board-toolbar.tsx`
- `web/features/task/task-create-dialog.tsx`
- `web/components/ui/toast-viewport.tsx`

## 第 6 阶段核心组件

- `web/features/project/project-discover-page.tsx`
- `web/features/project/project-members-page.tsx`
- `web/features/project/project-member-invite-dialog.tsx`
- `web/features/project/project-join-button.tsx`
- `web/features/project/project-visibility-badge.tsx`
- `web/features/project/project-join-policy-badge.tsx`
- `web/features/project/project-member-workload-card.tsx`
- `web/features/member/member-avatar.tsx`
- `web/features/member/member-chip.tsx`
- `web/features/member/member-group.tsx`
- `web/features/member/assignee-badge.tsx`
- `web/features/member/member-color.ts`
- `web/features/task/task-group-switcher.tsx`
- `web/features/task/task-list-grouped-by-assignee.tsx`
- `web/features/task/task-assignee-group-section.tsx`
- `web/features/task/task-assignee-swimlane-board.tsx`

## 第 6 阶段数据库字段与迁移

- 新增 migration：`server/prisma/migrations/20260424110000_refactor_project_membership_system`
- `projects`
  - `join_policy`
  - `member_color_seed`
- `project_members`
  - `status`
  - `joined_at`
  - `invited_by`
  - `approved_by`
  - `display_color_token`
- 枚举调整
  - `ProjectVisibility`: `PRIVATE | MEMBERS_VISIBLE | ORG_VISIBLE`
  - `JoinPolicy`: `INVITE_ONLY | REQUEST_APPROVAL | OPEN`
  - `ProjectRole`: `OWNER | ADMIN | MEMBER | GUEST`
  - `ProjectMemberStatus`: `ACTIVE | INVITED | PENDING`

## 第 6 阶段手动测试清单

1. 用户 A 创建一个 `ORG_VISIBLE + REQUEST_APPROVAL` 项目，确认项目卡片出现在“我参与的项目”。
2. 用户 B 登录后访问 `/projects`，确认能在“可加入 / 可发现的项目”看到该项目，并能点击“申请加入”。
3. 用户 A 进入 `/projects/:id/members`，确认能看到 B 的待审批记录，并可执行“批准”或“拒绝”。
4. 用户 A 邀请一个已注册用户，确认被邀请用户在 `/projects` 的“可加入 / 可发现的项目”区域看到“接受邀请”。
5. 进入 `/projects/:id`，确认顶部能看到 owner、成员组、可见性标签、加入方式标签和负责人负载卡片。
6. 进入 `/projects/:id/tasks`，确认默认按负责人分组，第一组固定为“未分配”，并可切换到按模块 / 按状态 / 平铺表格。
7. 进入 `/projects/:id/board`，确认看板按状态列展示，并按负责人分成横向泳道。
8. 打开任务详情抽屉，确认标题下方第一屏出现负责人、状态、优先级、模块，并能使用“快速分配给我”。
9. 创建、更新任务后回到成员页和项目详情页，确认负责人负载统计会刷新。
10. 执行 `./build.sh` 后检查 systemd 迁移和服务日志，确认新 migration 已应用。

## 第 4 阶段拖拽状态同步策略

- 看板页基于 TanStack Query 的 board query 拉取当前项目任务，并在页面内维护一份可拖拽的本地任务顺序
- 拖拽结束后先对本地任务列表做乐观状态更新，立即把卡片移动到目标列
- 同时调用 `PATCH /api/tasks/:id/status` 写回后端
- 若接口失败，则把任务状态回滚到拖拽前，并通过 toast 提示错误原因
- 若接口成功，则把返回的最新任务实体写回任务列表缓存、看板缓存、任务详情缓存，并刷新项目统计缓存

## 下一阶段建议

- 评论：补评论回复、@成员和评论通知，把协作从单层评论推进到多人讨论
- 活动日志：把“查看更多”落成完整动态页，支持成员、任务、动作类型筛选
- 统计：新增负责人负载趋势、模块进展、任务吞吐和逾期风险等轻量分析视图

## 联调建议

- 先用已有任务详情抽屉接 `GET /api/tasks/:id/comments` 和 `POST /api/tasks/:id/comments`，优先打通评论流
- 评论列表可直接按接口返回顺序渲染，无需前端二次排序
- 任务详情中的“最近动态”建议优先接 `GET /api/tasks/:id/activities?page=1&pageSize=20`
- 项目详情页动态占位区可替换为 `GET /api/projects/:id/activities?page=1&pageSize=20`
- 前端在删除评论前可增加二次确认，删除成功后刷新评论列表与任务活动日志

## 第 2 阶段新增接口

- 项目
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/:id`
  - `PATCH /api/projects/:id`
  - `DELETE /api/projects/:id`
- 项目成员
  - `GET /api/projects/:id/members`
  - `POST /api/projects/:id/members`
- 模块
  - `GET /api/projects/:id/modules`
  - `POST /api/projects/:id/modules`
  - `GET /api/modules/:id`
  - `PATCH /api/modules/:id`
  - `DELETE /api/modules/:id`
- 任务
  - `GET /api/projects/:id/tasks`
  - `POST /api/projects/:id/tasks`
  - `GET /api/tasks/:id`
  - `PATCH /api/tasks/:id`
  - `DELETE /api/tasks/:id`
  - `PATCH /api/tasks/:id/status`
  - `PATCH /api/tasks/:id/priority`
  - `PATCH /api/tasks/:id/assignee`

## 目录结构

```text
B519-PMP/
├── .editorconfig
├── .env.example
├── .gitignore
├── Code-project-platform-design-spec.md
├── README.md
├── docker-compose.yml
├── package.json
├── server/
│   ├── .env.example
│   ├── .eslintrc.cjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/
│   │   │   ├── constants/auth.constants.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── skip-serialize.decorator.ts
│   │   │   ├── filters/http-exception.filter.ts
│   │   │   ├── interceptors/transform-response.interceptor.ts
│   │   │   ├── types/current-user.type.ts
│   │   │   └── utils/
│   │   ├── config/
│   │   │   ├── env.configuration.ts
│   │   │   └── validation.schema.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-auth.guard.ts
│   │   │   │   ├── interfaces/
│   │   │   │   │   └── jwt-payload.interface.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── modules/
│   │   │   │   ├── dto/
│   │   │   │   ├── modules.controller.ts
│   │   │   │   ├── modules.module.ts
│   │   │   │   └── modules.service.ts
│   │   │   ├── projects/
│   │   │   │   ├── dto/
│   │   │   │   ├── projects.controller.ts
│   │   │   │   ├── projects.module.ts
│   │   │   │   └── projects.service.ts
│   │   │   ├── tasks/
│   │   │   │   ├── dto/
│   │   │   │   ├── tasks.controller.ts
│   │   │   │   ├── tasks.module.ts
│   │   │   │   └── tasks.service.ts
│   │   │   └── users/
│   │   │       ├── users.module.ts
│   │   │       └── users.service.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── tsconfig.build.json
│   └── tsconfig.json
└── web/
    ├── .env.example
    ├── .eslintrc.json
    ├── app/
    │   ├── (app)/
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── (auth)/
    │   │   └── login/page.tsx
    │   ├── globals.css
    │   └── layout.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── app-header.tsx
    │   │   └── app-sidebar.tsx
    │   └── ui/
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       └── input.tsx
    ├── components.json
    ├── features/
    │   └── auth/
    │       ├── login-form.tsx
    │       └── logout-button.tsx
    ├── lib/
    │   ├── api.ts
    │   └── utils.ts
    ├── middleware.ts
    ├── next-env.d.ts
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.js
    ├── styles/
    │   └── theme.css
    ├── tailwind.config.ts
    └── tsconfig.json
```

## 启动步骤

1. 复制环境变量：

   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp web/.env.example web/.env.local
   ```

2. 启动基础依赖：

   ```bash
   docker compose up -d
   ```

3. 安装依赖：

   ```bash
   npm install
   ```

4. 生成 Prisma Client 并初始化数据库：

   ```bash
   npm run prisma:generate -w server
   npm run prisma:migrate -w server -- --name init
   ```

5. 启动后端：

   ```bash
   npm run dev:server
   ```

6. 启动前端：

   ```bash
   npm run dev:web
   ```

7. 访问：

   - 前端：`http://localhost:3000`
   - 后端：`http://localhost:3001/api`

## systemd 服务化

仓库已内置 systemd 安装脚本与 unit 模板，默认会把以下进程纳入同一套 systemd 编排：

- `b519-pmp-deps.service`：启动 `docker-compose.yml` 中的 PostgreSQL / Redis
- `b519-pmp-prepare.service`：执行 `npm install`、`prisma generate`、`prisma migrate deploy`、前后端构建
- `b519-pmp-server.service`：启动 NestJS 后端
- `b519-pmp-web.service`：启动 Next.js 前端
- `b519-pmp.service`：聚合服务，统一对外提供一键启动 / 停止入口

安装：

```bash
npm run service:install
```

安装并立即启动：

```bash
npm run service:install -- --start
```

如果主机拉取 Docker 镜像、`npm install` 或 `node-pre-gyp` 需要走代理，先准备 systemd 环境文件：

```bash
cp .env.systemd.example .env.systemd
```

按需修改其中的 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`、`NO_PROXY`，再执行安装或重启 service。

常用命令：

```bash
sudo systemctl start b519-pmp.service
sudo systemctl stop b519-pmp.service
sudo systemctl restart b519-pmp.service
sudo systemctl status b519-pmp.service
```

查看子服务状态：

```bash
sudo systemctl status b519-pmp-deps.service
sudo systemctl status b519-pmp-prepare.service
sudo systemctl status b519-pmp-server.service
sudo systemctl status b519-pmp-web.service
```

实时查看启动日志：

```bash
sudo journalctl -u b519-pmp-deps.service -u b519-pmp-prepare.service -u b519-pmp-server.service -u b519-pmp-web.service -f
```

卸载：

```bash
npm run service:uninstall
```

说明：

- service 默认按生产方式运行，后端通过 `node server/dist/main.js` 启动，前端通过 `next start` 启动
- service 依赖本机已安装可用的 `node`、`npm`、`docker compose` 与 `systemd`
- 首次 `start` 时会自动执行依赖安装、数据库迁移与前后端构建，耗时会明显长于普通重启
- 后端环境变量读取 `server/.env`，前端运行目录为 `web/`

> 第 2 阶段新增了 `projects.task_seq` 字段，用于生成安全递增的任务编号。
> 执行数据库初始化或迁移时，请确保最新 schema 已应用。

## 下一阶段建议

- 评论：补评论回复、@成员和评论通知，把协作从单层评论推进到多人讨论
- 活动日志：把“查看更多”落成完整动态页，支持成员、任务、动作类型筛选
- 统计：新增负责人负载趋势、模块进展、任务吞吐和逾期风险等轻量分析视图

## 后续联调建议

- 前端先接 `GET /api/projects`、`GET /api/projects/:id`、`GET /api/projects/:id/tasks` 三个读取接口，完成项目首页与任务列表联调
- 新建任务时先拉 `GET /api/projects/:id/modules` 与 `GET /api/projects/:id/members`，用于模块和负责人选择器
- 前端任务编辑建议优先走专用接口：状态、优先级、负责人分别调用独立 patch 路由，减少表单 diff 复杂度
- 联调时统一携带 Cookie，前端请求需开启 `credentials: "include"`
