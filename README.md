# Code Project Platform

基于设计文档 `Code-project-platform-design-spec.md` 的第 1 阶段实现，当前完成：

- 前后端分离的 monorepo 基础工程初始化
- NestJS + Prisma + PostgreSQL + Redis 后端基础结构
- `users`、`projects`、`project_members`、`modules`、`tasks`、`task_comments`、`task_activity_logs`、`labels`、`task_labels` Prisma schema
- 认证模块：`register`、`login`、`me`、`logout`
- Next.js + TypeScript + Tailwind CSS + shadcn/ui 风格基础页面
- 登录页、首页骨架、左侧导航栏、顶部栏
- `docker-compose.yml` 中的 PostgreSQL 与 Redis

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
│   │   │   └── interceptors/transform-response.interceptor.ts
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

## 下一阶段建议

- 接入项目、模块、任务三大领域模块的 REST API
- 增加项目首页概览、任务列表、看板三类业务页面
- 引入 TanStack Query 与 Zustand，补齐前端数据层
- 增加基于项目成员角色的权限校验与操作日志写入
