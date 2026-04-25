"use client";

import { FolderKanban, Plus, RefreshCcw, SearchCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/features/project/project-card";
import { ProjectCreateDialog } from "@/features/project/project-create-dialog";
import { useDiscoverableProjectsQuery, useProjectsQuery } from "@/features/project/queries";

function SectionCard({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-[#e8edf4] shadow-[0_14px_32px_rgba(31,35,41,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <p className="text-sm text-[#8b95a7]">{description}</p>
          <CardTitle className="mt-1">{title}</CardTitle>
        </div>
        <div className="rounded-full bg-[#f5f7fb] px-4 py-2 text-sm text-[#4e5969]">共 {count} 个项目</div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function ProjectListPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const joinedProjectsQuery = useProjectsQuery();
  const discoverableProjectsQuery = useDiscoverableProjectsQuery();

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
                <h1 className="text-[32px] font-semibold tracking-tight text-[#1f2329]">
                  项目入口已经切到“我参与 + 可发现”
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[#646a73]">
                  这里不再只显示“我已加入的项目”。私密项目保留访问边界，组织内可见项目则会出现在可发现区域，用户可直接加入或发起申请。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  void joinedProjectsQuery.refetch();
                  void discoverableProjectsQuery.refetch();
                }}
              >
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

        <SectionCard
          title="我参与的项目"
          description="按更新时间排列"
          count={joinedProjectsQuery.data?.length ?? 0}
        >
          {joinedProjectsQuery.isLoading ? (
            <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm text-[#8b95a7]">
              正在加载项目列表...
            </div>
          ) : joinedProjectsQuery.isError ? (
            <div className="rounded-[24px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
              {joinedProjectsQuery.error.message}
            </div>
          ) : joinedProjectsQuery.data && joinedProjectsQuery.data.length > 0 ? (
            joinedProjectsQuery.data.map((project) => (
              <ProjectCard key={project.id} project={project} mode="joined" />
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm leading-7 text-[#8b95a7]">
              你还没有参与任何项目，先创建一个项目，或者从下方可发现区域加入。
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="可加入 / 可发现的项目"
          description="组织内可见或已经收到邀请"
          count={discoverableProjectsQuery.data?.length ?? 0}
        >
          {discoverableProjectsQuery.isLoading ? (
            <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm text-[#8b95a7]">
              正在加载可发现项目...
            </div>
          ) : discoverableProjectsQuery.isError ? (
            <div className="rounded-[24px] border border-dashed border-[#ffd8d2] bg-[#fff7f5] p-8 text-sm text-[#d83931]">
              {discoverableProjectsQuery.error.message}
            </div>
          ) : discoverableProjectsQuery.data && discoverableProjectsQuery.data.length > 0 ? (
            discoverableProjectsQuery.data.map((project) => (
              <ProjectCard key={project.id} project={project} mode="discoverable" />
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-8 text-sm leading-7 text-[#8b95a7]">
              <div className="flex items-center gap-2 text-[#4e5969]">
                <SearchCheck className="h-4 w-4" />
                当前没有新的可发现项目
              </div>
              <p className="mt-2">如果项目 owner 开启组织内可见或发出邀请，这里会出现可加入入口。</p>
            </div>
          )}
        </SectionCard>
      </div>

      <ProjectCreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </>
  );
}
