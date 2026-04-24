import { TaskListPage } from "@/features/task/task-list-page";

export default async function ProjectTasksRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TaskListPage projectId={id} />;
}
