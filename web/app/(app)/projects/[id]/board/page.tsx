import { TaskBoardPage } from "@/features/task/task-board-page";

export default async function ProjectBoardRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TaskBoardPage projectId={id} />;
}
