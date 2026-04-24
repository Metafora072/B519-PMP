import { ProjectDetailPage } from "@/features/project/project-detail-page";

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectDetailPage projectId={id} />;
}
