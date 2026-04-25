import { ProjectMembersPage } from "@/features/project/project-members-page";

export default async function ProjectMembersRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectMembersPage projectId={id} />;
}
