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
- 拖拽改状态采用前端乐观更新，请求失败时自动回滚并通过 toast 提示错误
- 拖拽与编辑成功后同步刷新任务列表缓存、看板缓存、任务详情缓存与项目统计缓存

## 第 3 阶段新增路由

- `/projects`
- `/projects/:id`
- `/projects/:id/tasks`

## 第 4 阶段新增路由

- `/projects/:id/board`

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

## 第 4 阶段拖拽状态同步策略

- 看板页基于 TanStack Query 的 board query 拉取当前项目任务，并在页面内维护一份可拖拽的本地任务顺序
- 拖拽结束后先对本地任务列表做乐观状态更新，立即把卡片移动到目标列
- 同时调用 `PATCH /api/tasks/:id/status` 写回后端
- 若接口失败，则把任务状态回滚到拖拽前，并通过 toast 提示错误原因
- 若接口成功，则把返回的最新任务实体写回任务列表缓存、看板缓存、任务详情缓存，并刷新项目统计缓存

## 下一阶段建议

- 评论：接入任务评论流，支持任务内协作闭环
- 活动日志：把后端 activity log 前端化，替换详情页占位动态区
- 统计：增加项目燃尽、负责人负载、模块进展等轻量分析卡片

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

- 前端接入项目列表、项目详情、模块列表、任务列表接口，完成真实数据渲染
- 继续补齐评论、活动日志查询、项目概览统计接口
- 增加更细粒度的角色权限，如项目管理员、模块负责人、普通成员的写入差异
- 为任务状态流转补充更明确的业务规则校验与集成测试

## 后续联调建议

- 前端先接 `GET /api/projects`、`GET /api/projects/:id`、`GET /api/projects/:id/tasks` 三个读取接口，完成项目首页与任务列表联调
- 新建任务时先拉 `GET /api/projects/:id/modules` 与 `GET /api/projects/:id/members`，用于模块和负责人选择器
- 前端任务编辑建议优先走专用接口：状态、优先级、负责人分别调用独立 patch 路由，减少表单 diff 复杂度
- 联调时统一携带 Cookie，前端请求需开启 `credentials: "include"`
