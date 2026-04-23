# 代码项目管理平台设计文档

## 1. 项目目标

本项目旨在开发一个面向研发团队的代码项目管理平台，用于统一管理项目中的模块、任务、负责人、优先级、状态与代码关联信息。平台核心目标如下：

1. 支持按项目进行任务协作管理。
2. 支持任务归属到具体模块，并指定负责人。
3. 支持任务的新增、编辑、删除、完成、流转。
4. 支持优先级体系，如 P0、P1、P2、P3。
5. 支持看板、列表、我的任务等多视图协作方式。
6. 支持与代码仓库信息关联，例如仓库、分支、PR、Issue。
7. 界面风格尽可能接近飞书项目：轻量、现代、清爽、高信息密度但不拥挤。

该项目不追求一次性复刻完整企业级项目系统，而是优先构建一个高完成度、高可用性的 MVP，并保留后续向流程配置、自定义字段、自动化、统计分析方向扩展的能力。

---

## 2. 产品定位与范围

### 2.1 产品定位

这是一个偏研发协作场景的任务管理平台，主要服务于以下场景：

* 代码项目研发任务拆分
* 模块负责人分工管理
* 版本迭代任务跟踪
* Bug、需求、优化项统一追踪
* 团队成员工作协同与状态同步

### 2.2 初期范围

第一阶段只实现最核心的任务协作闭环：

* 用户登录
* 工作空间 / 项目管理
* 模块管理
* 任务管理
* 任务状态流转
* 优先级管理
* 看板视图
* 列表视图
* 我的任务
* 评论
* 操作日志
* 基础权限

### 2.3 暂不进入 MVP 的功能

以下功能不进入第一版，但设计上要预留接口与表结构扩展空间：

* 自定义字段系统
* 自动化规则引擎
* 甘特图 / 时间线
* Wiki / 文档协同
* 工时管理
* 多组织体系
* 飞书消息通知
* 复杂审批流程
* 完整 GitHub / GitLab 双向同步

---

## 3. 用户角色与权限模型

### 3.1 角色定义

#### 3.1.1 系统管理员

负责整个平台级管理：

* 管理用户
* 管理全局配置
* 查看平台所有项目

#### 3.1.2 项目管理员

负责单个项目的管理：

* 编辑项目信息
* 管理成员
* 管理模块
* 管理任务状态配置
* 删除任务
* 调整任务优先级与负责人

#### 3.1.3 模块负责人

负责某个模块范围内的任务推进：

* 创建模块内任务
* 编辑模块内任务
* 分配模块内任务负责人
* 推进模块内任务状态

#### 3.1.4 普通成员

参与项目协作：

* 查看自己有权限访问的项目
* 创建任务
* 编辑自己创建的任务或被授权任务
* 评论任务
* 修改自己被分配任务的状态

#### 3.1.5 访客

仅可查看项目中开放范围内容，不可编辑。

### 3.2 权限矩阵

| 功能   | 系统管理员 | 项目管理员 | 模块负责人   | 普通成员    | 访客 |
| ---- | ----- | ----- | ------- | ------- | -- |
| 查看项目 | 是     | 是     | 是       | 是       | 是  |
| 编辑项目 | 是     | 是     | 否       | 否       | 否  |
| 管理成员 | 是     | 是     | 否       | 否       | 否  |
| 创建模块 | 是     | 是     | 否       | 否       | 否  |
| 编辑模块 | 是     | 是     | 是（所属模块） | 否       | 否  |
| 创建任务 | 是     | 是     | 是       | 是       | 否  |
| 编辑任务 | 是     | 是     | 是（所属模块） | 有限      | 否  |
| 删除任务 | 是     | 是     | 否       | 否       | 否  |
| 修改状态 | 是     | 是     | 是       | 是（自己任务） | 否  |
| 评论   | 是     | 是     | 是       | 是       | 否  |
| 查看日志 | 是     | 是     | 是       | 是       | 否  |

普通成员的“有限编辑”建议限制为：

* 可编辑自己创建的任务
* 可编辑自己被分配的任务中的描述、截止时间、状态
* 不可删除任务
* 不可越权修改他人任务负责人

---

## 4. 产品信息架构

### 4.1 顶层信息结构

平台采用三层结构：

1. 工作空间 / 团队
2. 项目
3. 模块 + 任务

### 4.2 导航结构

#### 一级导航

* 首页
* 我的任务
* 项目
* 通知
* 设置

#### 项目内二级导航

* 概览
* 任务列表
* 看板
* 模块
* 成员
* 统计
* 设置

### 4.3 页面层级

#### 首页

展示：

* 最近访问项目
* 我的待办
* 高优任务
* 逾期任务
* 任务趋势摘要

#### 我的任务页

展示当前用户相关的任务集合：

* 指派给我
* 我创建的
* 我关注的
* 今日到期
* 已逾期

#### 项目概览页

展示项目核心信息：

* 项目名称、描述、状态
* 模块统计
* 任务状态分布
* 优先级分布
* 最近动态
* 今日重点任务

#### 任务列表页

表格化展示任务，可按以下维度筛选或排序：

* 状态
* 优先级
* 模块
* 负责人
* 创建人
* 截止时间
* 标签

#### 看板页

按状态进行列分组，支持任务卡片拖拽。

默认列：

* 待开始
* 进行中
* 已完成

可扩展为：

* 待处理
* 设计中
* 开发中
* 测试中
* 已完成
* 已关闭

#### 模块页

展示项目中的所有模块：

* 模块名称
* 模块负责人
* 任务数量
* 完成率
* 最近更新时间

#### 成员页

展示项目成员及其角色、任务负载、完成情况。

#### 设置页

配置项目基础信息：

* 项目名称
* 项目描述
* 状态流
* 优先级规则
* 成员权限
* 默认视图

---

## 5. 核心对象模型

### 5.1 Project

项目实体，代表一个代码项目或研发项目。

字段建议：

* id
* name
* key
* description
* icon
* status
* visibility
* owner_id
* created_at
* updated_at

### 5.2 Module

模块实体，用于对任务进行业务归类。

字段建议：

* id
* project_id
* name
* description
* owner_id
* color
* sort_order
* created_at
* updated_at

### 5.3 Task

任务实体，是平台最核心的对象。

字段建议：

* id
* project_id
* module_id
* task_no
* title
* description
* type
* status
* priority
* creator_id
* assignee_id
* due_at
* start_at
* completed_at
* parent_task_id
* repo_name
* branch_name
* pr_url
* issue_url
* estimate_hours
* created_at
* updated_at
* deleted_at

### 5.4 Comment

任务评论。

字段建议：

* id
* task_id
* user_id
* content
* created_at
* updated_at

### 5.5 ActivityLog

任务相关的操作日志。

字段建议：

* id
* project_id
* task_id
* operator_id
* action_type
* action_detail
* created_at

---

## 6. 任务字段设计

### 6.1 必选字段

MVP 中任务至少支持以下字段：

* 标题
* 描述
* 所属项目
* 所属模块
* 负责人
* 创建人
* 状态
* 优先级
* 截止时间
* 标签

### 6.2 推荐内置枚举

#### 优先级

* P0：阻塞级
* P1：高优先
* P2：普通优先
* P3：低优先

#### 任务类型

* 需求
* 缺陷
* 优化
* 技术债
* 研究项

#### 状态

* Todo
* In Progress
* Done
* Closed

### 6.3 扩展字段预留

后续可扩展：

* 预计工时
* 实际工时
* 风险等级
* 业务线
* Sprint
* Story Point
* 版本号

---

## 7. 页面详细设计

## 7.1 全局 UI 设计目标

整体视觉目标：

* 接近飞书项目的现代企业协作风格
* 白底、浅灰分区、柔和阴影、圆角卡片
* 高信息密度，但保证充足留白
* 交互轻量，不做厚重的后台管理风格
* 强调看板与任务编辑体验

### 7.1.1 色彩建议

* 主背景：#F5F7FA
* 卡片背景：#FFFFFF
* 主文字：#1F2329
* 次级文字：#646A73
* 边框：#E5E6EB
* 主色：#3370FF
* P0：#F53F3F
* P1：#FF7D00
* P2：#FFB400
* P3：#86909C

### 7.1.2 圆角与阴影

* 卡片圆角：12px
* 按钮圆角：8px
* 弹窗圆角：16px
* 阴影：轻阴影，避免厚重悬浮感

### 7.1.3 字体层级

* 页面标题：24px / semibold
* 模块标题：18px / semibold
* 正文：14px / regular
* 辅助说明：12px / regular

---

## 7.2 首页设计

首页布局采用双栏：

左侧：

* 最近项目
* 我的待办

右侧：

* 今日重点
* 高优先级任务
* 最近动态

首页重点是帮助用户快速进入任务处理，不追求复杂统计。

---

## 7.3 项目概览页设计

区块布局建议：

顶部区域：

* 项目名称
* 项目描述
* 项目成员头像组
* 快速创建任务按钮

中部区域：

* 任务总数卡片
* 已完成卡片
* 进行中卡片
* 逾期卡片

下方左右两栏：

* 左：最近任务动态
* 右：按优先级与状态统计

---

## 7.4 任务列表页设计

采用表格 + 筛选栏结构。

顶部工具栏：

* 搜索框
* 状态筛选
* 优先级筛选
* 模块筛选
* 负责人筛选
* 新建任务按钮

表格列建议：

* 任务编号
* 标题
* 模块
* 优先级
* 状态
* 负责人
* 截止时间
* 更新时间

支持：

* 列排序
* 多条件筛选
* 批量选择
* 批量改状态
* 批量改负责人

---

## 7.5 看板页设计

看板是最接近飞书项目体验的核心页面，优先保证质量。

每列为一个状态，列头显示：

* 状态名
* 任务数

任务卡片显示：

* 标题
* 模块标签
* 优先级标签
* 负责人头像
* 截止时间

交互要求：

* 支持拖拽改变状态
* 拖拽时有高亮占位效果
* 列可横向滚动
* 卡片点击打开右侧详情抽屉

---

## 7.6 任务详情抽屉

点击任务后，从右侧弹出详情抽屉，而不是整页跳转。

抽屉内容：

* 标题
* 状态
* 优先级
* 所属模块
* 负责人
* 创建人
* 截止时间
* 描述
* 评论区
* 活动日志
* 代码关联信息

此处的体验非常关键，要尽量顺滑：

* 支持行内编辑
* 支持快捷切换状态与负责人
* 评论实时展示

---

## 7.7 模块页设计

模块以卡片或列表形式展示：

* 模块名称
* 模块负责人
* 任务总数
* 完成率进度条
* 最近更新时间

支持点击模块进入模块筛选后的任务视图。

---

## 8. 技术架构设计

## 8.1 技术选型建议

### 前端

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand 或 TanStack Query
* dnd-kit
* Recharts

### 后端

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis

### 基础设施

* Docker
* Nginx
* PM2 或 Node 原生进程管理
* MinIO 或对象存储（后续附件）

### 登录认证

* 第一版：账号密码 / 邮箱登录
* 后续：飞书 OAuth、GitHub OAuth

### 部署方式

* 前后端分离部署
* Nginx 反向代理
* PostgreSQL 独立服务
* Redis 独立服务

---

## 8.2 推荐目录结构

### 前端

```text
web/
  app/
  components/
  features/
    auth/
    project/
    task/
    module/
    dashboard/
  hooks/
  lib/
  store/
  styles/
```

### 后端

```text
server/
  src/
    modules/
      auth/
      users/
      projects/
      modules/
      tasks/
      comments/
      activity-logs/
      notifications/
    common/
    prisma/
    config/
  prisma/
    schema.prisma
```

---

## 9. 数据库设计

## 9.1 users

```sql
id bigint pk
email varchar unique
password_hash varchar
name varchar
avatar_url varchar
status varchar
created_at timestamp
updated_at timestamp
```

## 9.2 projects

```sql
id bigint pk
name varchar
project_key varchar unique
description text
icon varchar
visibility varchar
owner_id bigint
created_at timestamp
updated_at timestamp
```

## 9.3 project_members

```sql
id bigint pk
project_id bigint
user_id bigint
role varchar
created_at timestamp
```

## 9.4 modules

```sql
id bigint pk
project_id bigint
name varchar
description text
owner_id bigint
color varchar
sort_order int
created_at timestamp
updated_at timestamp
```

## 9.5 tasks

```sql
id bigint pk
project_id bigint
module_id bigint
task_no varchar
parent_task_id bigint null
title varchar
description text
type varchar
status varchar
priority varchar
creator_id bigint
assignee_id bigint null
due_at timestamp null
start_at timestamp null
completed_at timestamp null
repo_name varchar null
branch_name varchar null
pr_url varchar null
issue_url varchar null
estimate_hours int null
deleted_at timestamp null
created_at timestamp
updated_at timestamp
```

## 9.6 task_comments

```sql
id bigint pk
task_id bigint
user_id bigint
content text
created_at timestamp
updated_at timestamp
```

## 9.7 task_activity_logs

```sql
id bigint pk
project_id bigint
task_id bigint
operator_id bigint
action_type varchar
action_detail jsonb
created_at timestamp
```

## 9.8 labels

```sql
id bigint pk
project_id bigint
name varchar
color varchar
created_at timestamp
```

## 9.9 task_labels

```sql
id bigint pk
task_id bigint
label_id bigint
```

---

## 10. 后端接口设计

以下接口采用 REST 风格，后续如有需要可补 GraphQL。

## 10.1 认证模块

* POST /api/auth/register
* POST /api/auth/login
* POST /api/auth/logout
* GET /api/auth/me

## 10.2 项目模块

* GET /api/projects
* POST /api/projects
* GET /api/projects/:id
* PATCH /api/projects/:id
* DELETE /api/projects/:id

## 10.3 项目成员模块

* GET /api/projects/:id/members
* POST /api/projects/:id/members
* PATCH /api/projects/:id/members/:memberId
* DELETE /api/projects/:id/members/:memberId

## 10.4 模块管理

* GET /api/projects/:id/modules
* POST /api/projects/:id/modules
* GET /api/modules/:id
* PATCH /api/modules/:id
* DELETE /api/modules/:id

## 10.5 任务管理

* GET /api/projects/:id/tasks
* POST /api/projects/:id/tasks
* GET /api/tasks/:id
* PATCH /api/tasks/:id
* DELETE /api/tasks/:id
* PATCH /api/tasks/:id/status
* PATCH /api/tasks/:id/assignee
* PATCH /api/tasks/:id/priority

## 10.6 评论管理

* GET /api/tasks/:id/comments
* POST /api/tasks/:id/comments
* PATCH /api/comments/:id
* DELETE /api/comments/:id

## 10.7 活动日志

* GET /api/tasks/:id/activities
* GET /api/projects/:id/activities

## 10.8 首页与统计

* GET /api/dashboard/home
* GET /api/projects/:id/overview
* GET /api/projects/:id/stats/status
* GET /api/projects/:id/stats/priority

---

## 11. 关键业务规则

### 11.1 任务编号规则

每个项目内任务编号采用：

`PROJECTKEY-序号`

例如：

* CORE-1
* CORE-2
* CORE-35

### 11.2 删除规则

任务采用软删除，不物理删除。

### 11.3 状态流转规则

MVP 允许基础流转：

* Todo -> In Progress
* In Progress -> Done
* Done -> Closed
* In Progress -> Todo

项目管理员可重开任务。

### 11.4 日志记录规则

以下动作必须记录日志：

* 创建任务
* 删除任务
* 修改标题
* 修改描述
* 修改负责人
* 修改状态
* 修改优先级
* 添加评论

### 11.5 权限校验规则

后端必须兜底校验权限，不能只依赖前端隐藏按钮。

---

## 12. 前端组件设计

## 12.1 全局组件

* AppSidebar
* AppHeader
* UserAvatar
* SearchInput
* PageToolbar
* StatusBadge
* PriorityBadge
* MemberSelect
* DatePicker
* ConfirmDialog

## 12.2 项目组件

* ProjectCard
* ProjectOverviewHeader
* ProjectStatsCards
* ProjectMemberGroup

## 12.3 模块组件

* ModuleCard
* ModuleList
* ModuleFormDialog

## 12.4 任务组件

* TaskTable
* TaskBoard
* TaskBoardColumn
* TaskCard
* TaskDrawer
* TaskFormDialog
* TaskFilterBar
* TaskCommentList
* TaskActivityTimeline

---

## 13. 交互细节要求

### 13.1 任务创建

* 点击“新建任务”后弹出中型弹窗
* 支持快速录入标题与负责人
* 支持展开“更多字段”
* 提交后自动进入详情抽屉

### 13.2 任务编辑

* 详情页采用行内编辑，不频繁跳转页面
* 标题可直接点击编辑
* 状态、优先级、负责人支持下拉切换

### 13.3 看板拖拽

* 使用 dnd-kit
* 拖拽时卡片阴影增强
* 目标列高亮
* 拖拽成功后乐观更新，再请求后端

### 13.4 筛选体验

筛选器采用胶囊式组合筛选，支持：

* 状态多选
* 优先级多选
* 模块多选
* 负责人多选
* 截止时间范围

---

## 14. 非功能需求

### 14.1 性能要求

* 首页首屏小于 2 秒
* 看板页面首次加载小于 2.5 秒
* 拖拽状态变更响应小于 300ms 的视觉反馈

### 14.2 可维护性要求

* 前端采用 feature-based 目录划分
* 后端按业务模块拆分
* DTO、Service、Controller 分层清晰
* 统一错误码与响应格式

### 14.3 安全要求

* 登录态使用 HttpOnly Cookie 或安全 JWT 方案
* 所有写接口需要鉴权
* 对项目数据做权限过滤
* 防止越权访问他人项目数据

---

## 15. 分阶段开发计划

## 阶段 1：基础框架与认证

目标：完成系统基础骨架

内容：

* 前端项目初始化
* 后端项目初始化
* 用户登录注册
* 基础布局框架
* 数据库初始化

交付结果：

* 用户可登录进入系统
* 有全局导航和空页面骨架

## 阶段 2：项目与模块管理

目标：完成项目容器能力

内容：

* 项目 CRUD
* 成员列表
* 模块 CRUD
* 项目概览基础页

交付结果：

* 可以创建项目
* 可以创建模块

## 阶段 3：任务管理核心闭环

目标：实现核心任务系统

内容：

* 任务 CRUD
* 任务列表页
* 任务详情抽屉
* 优先级与状态流转
* 评论与日志

交付结果：

* 可以真正管理任务

## 阶段 4：看板与高级交互

目标：做出平台核心体验

内容：

* 看板拖拽
* 高级筛选
* 批量操作
* 任务搜索

交付结果：

* 接近可用的任务协作平台

## 阶段 5：统计与代码关联

目标：增强研发场景适配度

内容：

* 项目统计卡片
* 优先级统计
* 状态趋势
* 仓库 / PR / Issue 字段展示

交付结果：

* 可用于团队日常协作

---

## 16. Codex 开发协作方式

建议不要一次性让 Codex 开发整个系统，而是按里程碑分批推进。

### 16.1 推荐工作流

1. 先让 Codex 初始化前后端项目结构。
2. 再让 Codex 先完成数据库 schema 与基础接口。
3. 然后逐页开发前端页面。
4. 最后统一进行联调、样式精修与权限校验。

### 16.2 单次交给 Codex 的任务粒度

每次应聚焦一个小目标，例如：

* 完成 projects 模块后端 CRUD
* 完成任务列表页表格组件
* 完成看板拖拽
* 完成任务详情抽屉

不要让 Codex 一次做“整个项目平台”，而应拆成可验证的小块。

### 16.3 代码规范建议

* 前后端全 TypeScript
* ESLint + Prettier
* 接口返回统一格式
* PR 风格提交说明
* 所有核心逻辑配注释

---

## 17. 推荐的首个版本验收标准

第一版上线前至少满足以下条件：

1. 用户可登录。
2. 可创建项目。
3. 可创建模块。
4. 可创建任务并分配负责人。
5. 可设置 P0/P1/P2/P3。
6. 可在列表与看板中查看任务。
7. 可修改状态为完成。
8. 可评论与查看操作日志。
9. 页面视觉统一、可连续使用。

---

## 18. 后续扩展路线

当 MVP 稳定后，可按以下顺序扩展：

1. 自定义字段系统
2. 自定义状态流
3. Sprint / 迭代管理
4. 通知中心
5. GitHub / GitLab 集成
6. 数据统计大盘
7. 飞书登录与飞书消息通知
8. 自动化规则引擎

---

## 19. 最终建议

这个平台不建议从“功能数量”上对标飞书项目，而应该从“核心体验完成度”上逼近。

优先把以下三件事做到足够好：

1. 任务新增、编辑、流转足够顺滑。
2. 看板与列表视图足够稳定清晰。
3. UI 细节足够现代、轻量、统一。

只要这三部分做扎实，这个项目就已经具备很强的展示价值、实用价值与后续扩展价值。

