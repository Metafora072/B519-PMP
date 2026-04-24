"use client";

import { FolderKanban, Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/features/project/project-card";
import { ProjectCreateDialog } from "@/features/project/project-create-dialog";
import { useProjectsQuery } from "@/features/project/queries";

export function ProjectListPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const projectsQuery = useProjectsQuery();

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-[#e8edf4] bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_56%,#eef4ff_100%)] p-7 shadow-[0_18px_40px_rgba(31,35,41,0.05)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#3370ff] shadow-sm">
                <FolderKanban className="h-4 w-4" />
                项目空间
              </div>
              <div>
                <h1 className="text-[32px] font-semibold tracking-tight text-[#1f2329]">项目页已经接入真实数据</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#646a73]">
                  当前列表直接读取后端项目接口，卡片信息覆盖项目描述、成员数、任务数与更新时间，可继续扩展归档、排序与更多项目操作。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => projectsQuery.refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                刷新列表
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                创建项目
              </Button>
            </div>
          </div>
        </section>

        <Card className="border-[#e8edf4] shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <p className="text-sm text-[#8b95a7]">全部项目</p>
              <CardTitle className="mt-1">按更新时间排列</CardTitle>
            </div>
            <div className="rounded-full bg-[#f5f7fb] px-4 py-2 text-sm text-[#4e5969]">
              共 {projectsQuery.data?.length ?? 0} 个项目
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectsQuery.isLoading ? (
              <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm text-[#8b95a7]">
                正在加载项目列表...
              </div>
            ) : projectsQuery.isError ? (
              <div className="rounded-[24px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
                {projectsQuery.error.message}
              </div>
            ) : projectsQuery.data && projectsQuery.data.length > 0 ? (
              projectsQuery.data.map((project) => <ProjectCard key={project.id} project={project} />)
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm leading-7 text-[#8b95a7]">
                还没有项目数据，先创建一个项目，把第 3 阶段业务页面真正跑起来。
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProjectCreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </>
  );
}
