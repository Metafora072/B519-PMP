import { ArrowUpRight, Clock3, FolderKanban, ListTodo, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const overviewStats = [
  { label: "最近项目", value: "03", icon: FolderKanban, hint: "今日有 2 个项目发生更新" },
  { label: "我的待办", value: "12", icon: ListTodo, hint: "4 项为进行中" },
  { label: "今日重点", value: "05", icon: Sparkles, hint: "2 项为 P0 / P1" },
  { label: "即将到期", value: "03", icon: Clock3, hint: "48 小时内需要推进" },
];

const recentProjects = [
  { name: "项目管理平台 MVP", desc: "认证模块与基础工程", progress: "Phase 1 / 38%" },
  { name: "研发流水线改造", desc: "CI 调度与代码关联", progress: "Planning / 12%" },
  { name: "运营后台升级", desc: "任务状态看板优化", progress: "Execution / 64%" },
];

const focusTasks = [
  { title: "完成认证接口联调", priority: "P1", owner: "后端" },
  { title: "首页骨架与导航布局", priority: "P2", owner: "前端" },
  { title: "设计任务状态枚举与标签关系", priority: "P1", owner: "数据层" },
];

const activityFeed = [
  "张弛创建了任务 PMP-12，并指派给模块负责人。",
  "项目管理平台 MVP 更新了任务优先级配置。",
  "认证模块完成接口定义，等待前端登录页联调。",
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e5e6eb] bg-gradient-to-r from-white to-[#f7faff] p-6 shadow-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">首页概览</Badge>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-[#1f2329]">
                研发协作平台工作台
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#646a73]">
                这一版先提供登录态后的基础工作区骨架，聚焦最近项目、我的任务、重点事项与动态卡片。
              </p>
            </div>
          </div>
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#3370ff] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#245bdb]">
            新建任务
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-[#e5e6eb]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-[#646a73]">{item.label}</CardTitle>
                <div className="rounded-xl bg-[#f2f5ff] p-2 text-[#3370ff]">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[#1f2329]">{item.value}</p>
                <p className="mt-2 text-sm text-[#86909c]">{item.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="border-[#e5e6eb]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近项目</CardTitle>
            <button className="inline-flex items-center gap-1 text-sm font-medium text-[#3370ff]">
              查看全部
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.name}
                className="rounded-2xl border border-[#e5e6eb] bg-[#fbfcfe] p-4 transition hover:border-[#c9d7ff]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#1f2329]">{project.name}</p>
                    <p className="mt-1 text-sm text-[#646a73]">{project.desc}</p>
                  </div>
                  <Badge variant="outline">{project.progress}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#e5e6eb]">
          <CardHeader>
            <CardTitle>今日重点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {focusTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-[#e5e6eb] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[#1f2329]">{task.title}</p>
                  <Badge variant={task.priority === "P1" ? "warning" : "secondary"}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-[#646a73]">所属：{task.owner}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-[#e5e6eb]">
          <CardHeader>
            <CardTitle>最近动态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((activity) => (
              <div key={activity} className="rounded-2xl bg-[#f7f9fc] px-4 py-3 text-sm leading-6 text-[#646a73]">
                {activity}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#e5e6eb]">
          <CardHeader>
            <CardTitle>本阶段说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-[#646a73]">
            <p>当前已完成工程初始化、认证模块、登录页和工作台骨架。</p>
            <p>下一阶段可以继续进入项目管理、模块管理、任务列表和看板能力。</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

