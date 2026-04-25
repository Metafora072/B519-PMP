"use client";

import { Button } from "@/components/ui/button";
import { useJoinProjectMutation } from "@/features/project/queries";
import { useToastStore } from "@/store/toast-store";

import type { ProjectSummary } from "@/services/types";

type ProjectJoinButtonProps = {
  project: ProjectSummary;
};

export function ProjectJoinButton({ project }: ProjectJoinButtonProps) {
  const joinMutation = useJoinProjectMutation(project.id);
  const pushToast = useToastStore((state) => state.pushToast);

  if (project.viewerMembership?.status === "ACTIVE") {
    return null;
  }

  if (project.joinAction === "PENDING") {
    return (
      <Button variant="outline" disabled>
        请求已发送
      </Button>
    );
  }

  if (!project.joinAction) {
    return null;
  }

  async function handleJoin() {
    try {
      const result = await joinMutation.mutateAsync();
      pushToast({
        tone: "success",
        title: result.result === "joined" ? "已加入项目" : "加入申请已提交",
        description:
          result.result === "joined" ? "现在可以进入项目并查看任务。" : "等待 owner 或 admin 审批。",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  }

  return (
    <Button
      variant={project.joinAction === "JOIN" || project.joinAction === "INVITED" ? "default" : "outline"}
      onClick={handleJoin}
      disabled={joinMutation.isPending}
    >
      {joinMutation.isPending
        ? "处理中..."
        : project.joinAction === "JOIN"
          ? "直接加入"
          : project.joinAction === "REQUEST"
            ? "申请加入"
            : "接受邀请"}
    </Button>
  );
}
