import { getProjects } from "@/actions/project.actions";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects — JobOS" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initialProjects={projects} />;
}
